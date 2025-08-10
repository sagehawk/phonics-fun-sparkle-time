from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    page.goto("http://localhost:5173/")

    # Set word length to 3
    page.locator('input[type="range"]').fill("3")

    # Find the word "CAT"
    while page.locator('div[data-letter-display]').inner_text() != "CAT":
        page.click('button.w-full.h-full', force=True)

    # Screenshot of "CAT" with colored "C"
    page.screenshot(path="jules-scratch/verification/01_cat.png")

    # Click the first letter 'C'
    page.click('span:has-text("C")')

    # Screenshot of the rhyming word
    page.screenshot(path="jules-scratch/verification/02_rhyme.png")

    # Click the rest of the word
    page.click('span:has-text("A")')

    # Screenshot of the next word
    page.screenshot(path="jules-scratch/verification/03_next.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
