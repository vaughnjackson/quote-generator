from flask import Flask, render_template, request, jsonify
import requests
import random

app = Flask(__name__)

# Quotable API configuration
QUOTABLE_API_BASE = "http://api.quotable.io"

def get_random_quote(tag=None, min_length=None, max_length=None):
    """Fetch random quote from Quotable API"""
    try:
        params = {}
        if tag:
            params['tags'] = tag
        if min_length:
            params['minLength'] = min_length
        if max_length:
            params['maxLength'] = max_length
            
        response = requests.get(f"{QUOTABLE_API_BASE}/random", params=params, timeout=5)
        
        if response.status_code == 200:
            return response.json()
        else:
            return None
    except requests.exceptions.RequestException:
        return None

def get_fallback_quote():
    """Fallback quotes when API is unavailable"""
    fallback_quotes = [
        {
            "content": "The only way to do great work is to love what you do.",
            "author": "Steve Jobs",
            "tags": ["motivational"]
        },
        {
            "content": "Innovation distinguishes between a leader and a follower.",
            "author": "Steve Jobs", 
            "tags": ["business"]
        },
        {
            "content": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "author": "Winston Churchill",
            "tags": ["success"]
        }
    ]
    return random.choice(fallback_quotes)

@app.route('/')
def home():
    """Home page with quote categories"""
    return render_template('index.html')

@app.route('/quote')
def quote():
    """Display random quote based on category"""
    category = request.args.get('category', '')
    
    # Map user-friendly categories to Quotable API tags
    category_mapping = {
        'motivational': 'motivational',
        'success': 'success', 
        'wisdom': 'wisdom',
        'life': 'life',
        'business': 'business'
    }
    
    tag = category_mapping.get(category.lower())
    quote_data = get_random_quote(tag=tag)
    
    # Use fallback if API fails
    if not quote_data:
        quote_data = get_fallback_quote()
        quote_data['api_error'] = True
    
    return render_template('quote.html', 
                         quote=quote_data, 
                         category=category)

@app.route('/api/quote')
def api_quote():
    """JSON API endpoint for AJAX requests"""
    category = request.args.get('category', '')
    tag = category if category else None
    
    quote_data = get_random_quote(tag=tag)
    if not quote_data:
        quote_data = get_fallback_quote()
        
    return jsonify(quote_data)

if __name__ == '__main__':
    app.run(debug=True)
