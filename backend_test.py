#!/usr/bin/env python3
"""
Backend API Tests for AccessAnywhere
Tests the web proxy and games collection functionality
"""

import requests
import json
import time
from datetime import datetime

# Use the production URL from frontend/.env
BASE_URL = "https://accessanywhere.preview.emergentagent.com/api"

def test_health_check():
    """Test the basic health check endpoint"""
    print("🔍 Testing health check endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if "AccessAnywhere" in data.get("message", ""):
                print("✅ Health check passed")
                return True
            else:
                print("❌ Health check failed - unexpected message")
                return False
        else:
            print(f"❌ Health check failed - status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed with error: {e}")
        return False

def test_games_initialization():
    """Test games initialization endpoint"""
    print("\n🎮 Testing games initialization...")
    try:
        response = requests.post(f"{BASE_URL}/games/init-defaults")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if "Initialized" in data.get("message", ""):
                print("✅ Games initialization passed")
                return True
            else:
                print("❌ Games initialization failed - unexpected message")
                return False
        else:
            print(f"❌ Games initialization failed - status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Games initialization failed with error: {e}")
        return False

def test_get_games():
    """Test getting all games"""
    print("\n📋 Testing get all games...")
    try:
        response = requests.get(f"{BASE_URL}/games")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            games = response.json()
            print(f"Number of games returned: {len(games)}")
            
            if len(games) > 0:
                print("Sample game:")
                print(json.dumps(games[0], indent=2))
                
                # Verify game structure
                required_fields = ['id', 'title', 'description', 'category', 'game_url']
                first_game = games[0]
                missing_fields = [field for field in required_fields if field not in first_game]
                
                if not missing_fields:
                    print("✅ Get games passed - games found with correct structure")
                    return True
                else:
                    print(f"❌ Get games failed - missing fields: {missing_fields}")
                    return False
            else:
                print("❌ Get games failed - no games returned")
                return False
        else:
            print(f"❌ Get games failed - status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get games failed with error: {e}")
        return False

def test_get_game_categories():
    """Test getting game categories"""
    print("\n📂 Testing get game categories...")
    try:
        response = requests.get(f"{BASE_URL}/games/categories")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            categories = response.json()
            print(f"Categories returned: {categories}")
            
            if len(categories) > 0:
                # Verify category structure
                first_category = categories[0]
                if 'category' in first_category and 'count' in first_category:
                    print("✅ Get categories passed")
                    return True
                else:
                    print("❌ Get categories failed - incorrect structure")
                    return False
            else:
                print("❌ Get categories failed - no categories returned")
                return False
        else:
            print(f"❌ Get categories failed - status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get categories failed with error: {e}")
        return False

def test_create_game():
    """Test creating a new game"""
    print("\n➕ Testing create game...")
    try:
        test_game = {
            "title": "Test Game",
            "description": "A test game for API testing",
            "category": "Test",
            "game_url": "https://example.com/test-game",
            "thumbnail": "https://example.com/test-thumbnail.jpg"
        }
        
        response = requests.post(f"{BASE_URL}/games", json=test_game)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            created_game = response.json()
            print(f"Created game: {json.dumps(created_game, indent=2)}")
            
            # Verify the created game has all required fields
            required_fields = ['id', 'title', 'description', 'category', 'game_url']
            missing_fields = [field for field in required_fields if field not in created_game]
            
            if not missing_fields:
                print("✅ Create game passed")
                return True, created_game.get('id')
            else:
                print(f"❌ Create game failed - missing fields: {missing_fields}")
                return False, None
        else:
            print(f"❌ Create game failed - status code {response.status_code}")
            return False, None
    except Exception as e:
        print(f"❌ Create game failed with error: {e}")
        return False, None

def test_delete_game(game_id):
    """Test deleting a game"""
    if not game_id:
        print("\n🗑️ Skipping delete game test - no game ID provided")
        return True
        
    print(f"\n🗑️ Testing delete game with ID: {game_id}...")
    try:
        response = requests.delete(f"{BASE_URL}/games/{game_id}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Delete result: {result}")
            print("✅ Delete game passed")
            return True
        else:
            print(f"❌ Delete game failed - status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Delete game failed with error: {e}")
        return False

def test_proxy_functionality():
    """Test web proxy functionality"""
    print("\n🌐 Testing web proxy functionality...")
    
    # Test POST /api/proxy
    print("Testing POST /api/proxy...")
    try:
        proxy_request = {"url": "httpbin.org/get"}
        response = requests.post(f"{BASE_URL}/proxy", json=proxy_request, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ POST proxy endpoint passed")
            post_success = True
        else:
            print(f"❌ POST proxy endpoint failed - status code {response.status_code}")
            post_success = False
    except Exception as e:
        print(f"❌ POST proxy endpoint failed with error: {e}")
        post_success = False
    
    # Test GET /api/proxy-direct
    print("\nTesting GET /api/proxy-direct...")
    try:
        response = requests.get(f"{BASE_URL}/proxy-direct?url=httpbin.org/get", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ GET proxy-direct endpoint passed")
            get_success = True
        else:
            print(f"❌ GET proxy-direct endpoint failed - status code {response.status_code}")
            get_success = False
    except Exception as e:
        print(f"❌ GET proxy-direct endpoint failed with error: {e}")
        get_success = False
    
    return post_success and get_success

def test_status_endpoints():
    """Test status check endpoints"""
    print("\n📊 Testing status endpoints...")
    
    # Test creating a status check
    try:
        status_data = {"client_name": "test_client"}
        response = requests.post(f"{BASE_URL}/status", json=status_data)
        print(f"Create status - Status Code: {response.status_code}")
        
        if response.status_code == 200:
            created_status = response.json()
            print("✅ Create status check passed")
            create_success = True
        else:
            print(f"❌ Create status check failed - status code {response.status_code}")
            create_success = False
    except Exception as e:
        print(f"❌ Create status check failed with error: {e}")
        create_success = False
    
    # Test getting status checks
    try:
        response = requests.get(f"{BASE_URL}/status")
        print(f"Get status - Status Code: {response.status_code}")
        
        if response.status_code == 200:
            status_checks = response.json()
            print(f"Number of status checks: {len(status_checks)}")
            print("✅ Get status checks passed")
            get_success = True
        else:
            print(f"❌ Get status checks failed - status code {response.status_code}")
            get_success = False
    except Exception as e:
        print(f"❌ Get status checks failed with error: {e}")
        get_success = False
    
    return create_success and get_success

def main():
    """Run all backend tests"""
    print("🚀 Starting AccessAnywhere Backend API Tests")
    print(f"Testing against: {BASE_URL}")
    print("=" * 60)
    
    results = {}
    
    # Test 1: Health check
    results['health_check'] = test_health_check()
    
    # Test 2: Games initialization (critical for fixing "No games found")
    results['games_init'] = test_games_initialization()
    
    # Test 3: Get games (this is the main issue)
    results['get_games'] = test_get_games()
    
    # Test 4: Get game categories
    results['get_categories'] = test_get_game_categories()
    
    # Test 5: Create and delete game
    create_success, game_id = test_create_game()
    results['create_game'] = create_success
    results['delete_game'] = test_delete_game(game_id)
    
    # Test 6: Proxy functionality
    results['proxy'] = test_proxy_functionality()
    
    # Test 7: Status endpoints
    results['status'] = test_status_endpoints()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
        if success:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if results.get('get_games', False) and results.get('games_init', False):
        print("\n🎯 CRITICAL: Games API is working - frontend should show games!")
    elif not results.get('get_games', False):
        print("\n🚨 CRITICAL: Games API is failing - this explains 'No games found' in frontend!")
    
    return results

if __name__ == "__main__":
    main()