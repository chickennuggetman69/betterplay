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
from urllib.parse import urljoin, urlparse, parse_qs, quote_plus
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

# GN-Math.dev proxy for direct access to games
@api_router.get("/gnmath-proxy")
async def gnmath_proxy():
    """Direct proxy to gn-math.dev for GN-Math games"""
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            
            response = await client.get('https://gn-math.dev/', headers=headers)
            
            if response.status_code == 200:
                content = response.text
                
                # Fix relative URLs to work within iframe
                content = re.sub(r'href="(/[^"]*)"', r'href="https://gn-math.dev\1"', content)
                content = re.sub(r'src="(/[^"]*)"', r'src="https://gn-math.dev\1"', content)
                content = re.sub(r"href='(/[^']*)'", r"href='https://gn-math.dev\1'", content)
                content = re.sub(r"src='(/[^']*)'", r"src='https://gn-math.dev\1'", content)
                
                return Response(content=content, media_type="text/html")
            else:
                raise HTTPException(status_code=response.status_code, detail="Failed to load gn-math.dev")
                
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"GN-Math proxy error: {str(e)}")

# Remove the games initialization - we'll just have the GN-Math portal

# Smart proxy that handles both search queries and URLs
@api_router.post("/smart-proxy")
async def smart_proxy(request: ProxyRequest):
    """Smart proxy that handles both search queries and direct URLs"""
    try:
        query = request.url.strip()
        import urllib.parse

        # Detect if input looks like a URL
        is_url = (
            query.startswith(('http://', 'https://')) or
            query.startswith('www.') or
            ('.' in query and ' ' not in query and len(query.split('.')) >= 2)
        )

        if is_url:
            if not query.startswith(('http://', 'https://')):
                query = 'https://' + query
            target_url = query
        else:
            encoded_query = urllib.parse.quote_plus(query)
            target_url = f"https://duckduckgo.com/html/?q={encoded_query}"

        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            response = await client.get(target_url, headers=headers)
            content_type = response.headers.get('content-type', 'text/html')

            if 'text/html' in content_type:
                content = response.text
                base_url = f"{urlparse(target_url).scheme}://{urlparse(target_url).netloc}"

                # Fix relative URLs
                content = re.sub(r'href="(/[^"]*)"', f'href="{base_url}\\1"', content)
                content = re.sub(r'src="(/[^"]*)"', f'src="{base_url}\\1"', content)
                content = re.sub(r"href='(/[^']*)'", f"href='{base_url}\\1'", content)
                content = re.sub(r"src='(/[^']*)'", f"src='{base_url}\\1'", content)
                content = re.sub(r'action="(/[^"]*)"', f'action="{base_url}\\1"', content)

                # Fix protocol-relative URLs
                content = re.sub(r'href="//', 'href="https://', content)
                content = re.sub(r'src="//', 'src="https://', content)

                return Response(content=content, media_type="text/html")
            else:
                return Response(content=response.content, media_type=content_type)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Smart proxy error: {str(e)}")
# Get search suggestions (optional enhancement)
@api_router.get("/search-suggestions")
async def get_search_suggestions(q: str = Query(...)):
    """Get search suggestions for autocomplete"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Use Google's suggestion API
            response = await client.get(
                f"https://suggestqueries.google.com/complete/search?client=firefox&q={q}"
            )
            if response.status_code == 200:
                return {"suggestions": response.json()[1][:5]}  # Return top 5 suggestions
            return {"suggestions": []}
    except:
        return {"suggestions": []}

# GN-Math specific proxy
@api_router.get("/gn-math-proxy")
async def gn_math_proxy(game: str = Query(...)):
    """Specific proxy for GN-Math games"""
    try:
        # Try to access the game directly from the repository
        base_urls = [
            f"https://gn-math.github.io/{game}/",
            f"https://raw.githubusercontent.com/genizy/web-port/main/{game}/index.html",
            f"https://genizy.github.io/web-port/{game}/"
        ]
        
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            
            for url in base_urls:
                try:
                    response = await client.get(url, headers=headers)
                    if response.status_code == 200:
                        content_type = response.headers.get('content-type', 'text/html')
                        
                        if 'text/html' in content_type:
                            content = response.text
                            # Fix relative URLs for the game
                            game_base = f"https://gn-math.github.io/{game}"
                            content = re.sub(r'href="([^http][^"]*)"', f'href="{game_base}/\\1"', content)
                            content = re.sub(r'src="([^http][^"]*)"', f'src="{game_base}/\\1"', content)
                            
                            return Response(content=content, media_type="text/html")
                        else:
                            return Response(content=response.content, media_type=content_type)
                except:
                    continue
                    
        raise HTTPException(status_code=404, detail=f"Game '{game}' not found in GN-Math repository")
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"GN-Math proxy error: {str(e)}")

# Get available GN-Math games
@api_router.get("/gn-math-games")
async def get_gn_math_games():
    """Get list of available GN-Math games from repository"""
    gn_math_game_list = [
        "undertale", "omori-fixed", "pizza-tower", "cuphead", "hotline-miami",
        "buckshot-roulette", "baldi-plus", "ultrakill", "thats-not-my-neighbor", 
        "people-playground", "amanda-the-adventurer", "andys-apple-farm", 
        "baldi-remaster", "bendy", "bergentruck", "bloodmoney", "class-of-09",
        "dead-plate", "deadseat", "donottakethiscathome", "fears-to-fathom",
        "happy-sheepies", "jelly-drift", "karlson", "kindergarten",
        "lacysflashgames", "milkman-karlson", "raft", "slender", "speed-stars",
        "the-man-in-the-window", "undertale-yellow", "web-fishing", "yume-nikki"
    ]
    
    return {
        "games": gn_math_game_list,
        "total": len(gn_math_game_list),
        "base_url": "https://gn-math.github.io"
    }

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
