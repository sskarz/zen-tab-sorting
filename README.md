# Zen Tab Sorting

Zen Tab Sorting reorganizes the current Zen Browser workspace into concise topic and task groups using DeepSeek through OpenRouter. Advanced Tab Groups supplies favicon-derived group colors.

## Setup

1. In Zen's **Settings → Sine Mods**, open Sine's settings and enable **Allow external JavaScript mods**. Sine blocks scripts from custom GitHub repositories by default; restart Zen after changing this setting.
2. Create a dedicated API key at [OpenRouter](https://openrouter.ai/keys). Set a small spending limit so the key cannot consume more than intended.
3. Click the Zen Tab Sorting button. On first use, enter the key in Firefox's masked password prompt.
4. The key is stored locally in the `zen.tidy-tabs.openrouter-api-key` Firefox preference. To replace or remove it, open `about:config`, search for that preference, and reset it. Zen Tab Sorting also clears the saved key after an HTTP 401 response.

## Data and privacy

For each eligible tab, Zen Tab Sorting sends only a temporary request ID, the visible title, the hostname without `www.`, and the current group name when present. It never sends full URLs, paths, query strings, page contents, Firefox tab IDs, or profile data.

Requests use OpenRouter's Zero Data Retention (`zdr`) routing and deny provider data collection. Providers must support every requested parameter, including strict JSON-schema output. If no compliant route is available, sorting fails; there is no local or less-private fallback. Review [OpenRouter's privacy documentation](https://openrouter.ai/docs/features/privacy-and-logging) for the current meaning and provider coverage of these controls.

## Behavior and failures

DeepSeek repartitions all eligible tabs in the active workspace. Pinned, essential, empty, glance, and split-view tabs are excluded. The current tab remains selected, and unrelated tabs may remain ungrouped.

The response is validated as a complete, non-duplicated partition before any browser state changes. The request is discarded if the workspace changes while it is running. Network, model, authentication, privacy-routing, and credit failures leave tabs untouched; mutation failures trigger an in-memory rollback to the previous assignments and order.

<p align="center">
  <img width="164" height="1020" alt="Zen Tab Sorting in Zen Browser" src="https://github.com/user-attachments/assets/88ca1f8c-182c-459b-8a7a-e596b8e833c0" />
</p>
