from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1280, 'height': 720})
    page = context.new_page()

    page.goto("http://localhost:8082/")

    # Set word length to 3
    page.get_by_role("button", name="3").click()
    page.wait_for_timeout(500) # wait for content to load

    # Screenshot of the initial word
    page.screenshot(path="jules-scratch/verification/01_initial_word.png")

    # Get the initial word
    initial_word = page.locator('div[data-letter-display]').inner_text()
    print(f"Initial word: {initial_word}")

    # Click the word to cycle rhyme
    page.locator('div[data-letter-display]').click()
    page.wait_for_timeout(500) # wait for animation

    # Screenshot of the rhyming word
    page.screenshot(path="jules-scratch/verification/02_rhyme.png")

    # Get the rhyming word
    rhyming_word = page.locator('div[data-letter-display]').inner_text()
    print(f"Rhyming word: {rhyming_word}")

    # Click the side of the screen to get a new word
    page.mouse.click(10, 10) # Click on the top-left corner
    page.wait_for_timeout(500) # wait for animation

    # Screenshot of the new word
    page.screenshot(path="jules-scratch/verification/03_new_word.png")

    # Get the new word
    new_word = page.locator('div[data-letter-display]').inner_text()
    print(f"New word: {new_word}")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
