from playwright.sync_api import sync_playwright
import os

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    
    errors = []
    page.on("console", lambda msg: print(f"PAGE LOG: [{msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: errors.append(err.message))
    
    url = "file://" + os.path.abspath("index.html")
    print(f"Navigating to {url}")
    page.goto(url)
    
    page.wait_for_timeout(5000)
    
    if errors:
        print("--- PAGE ERRORS ---")
        for e in errors:
            print(e)
            
    # Try to call login to see if it fails
    print("Attempting to call login()...")
    page.evaluate("login()")
    page.wait_for_timeout(2000)
    
    browser.close()
