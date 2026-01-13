#!/usr/bin/env python
"""
Simple runner script that starts FastAPI without importing everything at once
"""
import sys
import os

# Ensure we can import from src
sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    import uvicorn
    
    # Start with minimal configuration
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
