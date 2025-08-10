// Content script for HeyWeb! Voice Assistant
// This script is injected into web pages to enable web automation

(function() {
  'use strict';

  // Web automation functions
  const webAutomation = {
    // Click on elements by text, aria-label, or placeholder
    clickElement: function(targetText) {
      const selectors = [
        `[aria-label*="${targetText}" i]`,
        `[placeholder*="${targetText}" i]`,
        `button:contains("${targetText}")`,
        `a:contains("${targetText}")`,
        `input[value*="${targetText}" i]`,
        `label:contains("${targetText}")`,
        `*:contains("${targetText}")`
      ];

      for (const selector of selectors) {
        try {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            if (element.textContent.toLowerCase().includes(targetText.toLowerCase()) ||
                element.getAttribute('aria-label')?.toLowerCase().includes(targetText.toLowerCase()) ||
                element.getAttribute('placeholder')?.toLowerCase().includes(targetText.toLowerCase())) {
              element.click();
              return { success: true, element: element.tagName };
            }
          }
        } catch (e) {
          console.warn('Selector failed:', selector, e);
        }
      }
      return { success: false, error: 'Element not found' };
    },

    // Fill form fields
    fillFormField: function(fieldName, value) {
      const selectors = [
        `input[name*="${fieldName}" i]`,
        `input[placeholder*="${fieldName}" i]`,
        `input[aria-label*="${fieldName}" i]`,
        `textarea[name*="${fieldName}" i]`,
        `textarea[placeholder*="${fieldName}" i]`,
        `textarea[aria-label*="${fieldName}" i]`
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          element.value = value;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          return { success: true, element: element.tagName };
        }
      }
      return { success: false, error: 'Field not found' };
    },

    // Scroll the page
    scrollPage: function(direction) {
      const scrollAmount = direction === 'up' ? -300 : 300;
      window.scrollBy(0, scrollAmount);
      return { success: true, direction: direction };
    },

    // Get page information
    getPageInfo: function() {
      return {
        title: document.title,
        url: window.location.href,
        elements: {
          buttons: document.querySelectorAll('button').length,
          inputs: document.querySelectorAll('input').length,
          links: document.querySelectorAll('a').length
        }
      };
    },

    // Find elements by text
    findElementsByText: function(text) {
      const elements = [];
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT,
        null,
        false
      );

      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.toLowerCase().includes(text.toLowerCase())) {
          elements.push({
            tagName: node.tagName,
            text: node.textContent.trim().substring(0, 50),
            tag: node.outerHTML.substring(0, 100)
          });
        }
      }

      return elements.slice(0, 10); // Limit to first 10 results
    }
  };

  // Listen for messages from the extension
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case 'CLICK_ELEMENT':
        sendResponse(webAutomation.clickElement(request.target));
        break;
      case 'FILL_FORM':
        sendResponse(webAutomation.fillFormField(request.field, request.value));
        break;
      case 'SCROLL_PAGE':
        sendResponse(webAutomation.scrollPage(request.direction));
        break;
      case 'GET_PAGE_INFO':
        sendResponse(webAutomation.getPageInfo());
        break;
      case 'FIND_ELEMENTS':
        sendResponse(webAutomation.findElementsByText(request.text));
        break;
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  });

  // Expose functions to window for direct access
  window.heywebAutomation = webAutomation;

  // Notify that content script is loaded
  console.log('HeyWeb! Voice Assistant content script loaded');
})();
