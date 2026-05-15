from playwright.sync_api import sync_playwright
import os

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    
    page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
    page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))
    
    url = "file://" + os.path.abspath("index.html")
    print(f"Navigating to {url}")
    page.goto(url)
    
    page.wait_for_timeout(2000)
    page.screenshot(path="screenshot.png")
    browser.close()
