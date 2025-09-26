from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import Response, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import httpx
import re
from urllib.parse import urljoin, urlparse, parse_qs
import base64


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ProxyRequest(BaseModel):
    url: str
    
class Game(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    game_url: str
    thumbnail: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GameCreate(BaseModel):
    title: str
    description: str
    category: str
    game_url: str
    thumbnail: Optional[str] = None


# Proxy functionality
@api_router.post("/proxy")
async def proxy_website(request: ProxyRequest):
    """Proxy a website to bypass blocks"""
    try:
        if not request.url.startswith(('http://', 'https://')):
            request.url = 'https://' + request.url
            
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = await client.get(request.url, headers=headers)
            
            # Get content type
            content_type = response.headers.get('content-type', 'text/html')
            
            if 'text/html' in content_type:
                # Modify HTML to fix relative URLs
                content = response.text
                base_url = f"{urlparse(request.url).scheme}://{urlparse(request.url).netloc}"
                
                # Fix relative URLs in href and src attributes
                content = re.sub(r'href="(/[^"]*)"', f'href="{base_url}\\1"', content)
                content = re.sub(r'src="(/[^"]*)"', f'src="{base_url}\\1"', content)
                content = re.sub(r"href='(/[^']*)'", f"href='{base_url}\\1'", content)
                content = re.sub(r"src='(/[^']*)'", f"src='{base_url}\\1'", content)
                
                return Response(content=content, media_type="text/html")
            else:
                # For other content types, return as-is
                return Response(content=response.content, media_type=content_type)
                
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching website: {str(e)}")

@api_router.get("/proxy-direct")
async def proxy_direct(url: str = Query(...)):
    """Direct proxy endpoint for GET requests"""
    try:
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
            
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = await client.get(url, headers=headers)
            
            content_type = response.headers.get('content-type', 'text/html')
            
            if 'text/html' in content_type:
                content = response.text
                base_url = f"{urlparse(url).scheme}://{urlparse(url).netloc}"
                
                # Fix relative URLs
                content = re.sub(r'href="(/[^"]*)"', f'href="{base_url}\\1"', content)
                content = re.sub(r'src="(/[^"]*)"', f'src="{base_url}\\1"', content)
                
                return Response(content=content, media_type="text/html")
            else:
                return Response(content=response.content, media_type=content_type)
                
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching website: {str(e)}")

# Games functionality
@api_router.post("/games", response_model=Game)
async def create_game(game: GameCreate):
    """Add a new game to the collection"""
    game_dict = game.dict()
    game_obj = Game(**game_dict)
    await db.games.insert_one(game_obj.dict())
    return game_obj

@api_router.get("/games", response_model=List[Game])
async def get_games(category: Optional[str] = None):
    """Get all games or games by category"""
    query = {}
    if category:
        query["category"] = category
    
    games = await db.games.find(query).to_list(1000)
    return [Game(**game) for game in games]

@api_router.get("/games/categories")
async def get_game_categories():
    """Get all available game categories"""
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    categories = await db.games.aggregate(pipeline).to_list(100)
    return [{"category": cat["_id"], "count": cat["count"]} for cat in categories]

@api_router.delete("/games/{game_id}")
async def delete_game(game_id: str):
    """Delete a game"""
    result = await db.games.delete_one({"id": game_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Game not found")
    return {"message": "Game deleted successfully"}

# Initialize default games
@api_router.post("/games/init-defaults")
async def init_default_games():
    """Initialize the database with default games"""
    default_games = [
        {
            "title": "2048",
            "description": "Slide numbered tiles to combine them and reach 2048",
            "category": "Puzzle",
            "game_url": "https://play2048.co/",
            "thumbnail": "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop"
        },
        {
            "title": "Snake Game",
            "description": "Classic snake game - eat food and grow longer",
            "category": "Arcade",
            "game_url": "https://www.google.com/fbx?fbx=snake_arcade",
            "thumbnail": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop"
        },
        {
            "title": "Pac-Man",
            "description": "Classic arcade game - eat dots and avoid ghosts",
            "category": "Arcade",
            "game_url": "https://www.google.com/logos/2010/pacman10-i.html",
            "thumbnail": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=200&fit=crop"
        },
        {
            "title": "Tetris",
            "description": "Stack falling blocks to clear lines",
            "category": "Puzzle",
            "game_url": "https://tetris.com/play-tetris",
            "thumbnail": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300&h=200&fit=crop"
        },
        {
            "title": "Solitaire",
            "description": "Classic card game",
            "category": "Card",
            "game_url": "https://www.google.com/logos/2016/solitaire/standalone.html",
            "thumbnail": "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop"
        },
        {
            "title": "Chess",
            "description": "Play chess against computer or friends",
            "category": "Strategy",
            "game_url": "https://www.chess.com/play/computer",
            "thumbnail": "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=300&h=200&fit=crop"
        }
    ]
    
    # Clear existing games first
    await db.games.delete_many({})
    
    # Insert default games
    for game_data in default_games:
        game_obj = Game(**game_data)
        await db.games.insert_one(game_obj.dict())
    
    return {"message": f"Initialized {len(default_games)} default games"}

# Original routes
@api_router.get("/")
async def root():
    return {"message": "AccessAnywhere - Unblock websites and play games!"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()