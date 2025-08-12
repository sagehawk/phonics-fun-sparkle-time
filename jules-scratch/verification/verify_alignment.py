from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://127.0.0.1:8080/")
    page.wait_for_timeout(1000) # Wait for page to load
    page.screenshot(path="jules-scratch/verification/verification_1.png")

    page.press('body', '3')
    page.wait_for_timeout(500)
    page.screenshot(path="jules-scratch/verification/verification_2.png")

    page.press('body', 'ArrowRight')
    page.wait_for_timeout(500)
    page.screenshot(path="jules-scratch/verification/verification_3.png")

    page.press('body', 'ArrowUp')
    page.wait_for_timeout(500)
    page.screenshot(path="jules-scratch/verification/verification_4.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
