
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://127.0.0.1:8080/")

    # Check for the initial word
    expect(page.locator('[data-letter-display]')).to_be_visible()

    # Change word length to 3
    page.press('body', '3')
    page.wait_for_timeout(500)
    page.screenshot(path="jules-scratch/verification/word_length_3.png")

    # Change to the next word
    page.press('body', 'ArrowRight')
    page.wait_for_timeout(500)
    page.screenshot(path="jules-scratch/verification/word_changed.png")

    # Change to a rhyming word
    page.press('body', 'ArrowUp')
    page.wait_for_timeout(500)
    page.screenshot(path="jules-scratch/verification/rhyme_changed.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
