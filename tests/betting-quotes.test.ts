import { describe, expect, it } from 'vitest';
import { fetchBettingQuotes } from '../src/core.js';
import type { Page } from '../src/browser.js';

function fakePage(html: string): Page {
  return {
    async goto(url: string) {
      this.currentUrl = url;
    },
    async content() {
      return html;
    },
    url() {
      return this.currentUrl;
    },
    status() {
      return 200;
    },
    currentUrl: 'https://www.kicktipp.de/mycomm/tippabgabe',
  } as unknown as Page;
}

const html = `
  <div id="kicktipp-content">
    <div class="pagetitle">Tippabgabe - 4. Spieltag</div>
    <table>
      <tbody>
        <tr>
          <td>12.09.25 20:30</td>
          <td>Home Team</td>
          <td>Away Team</td>
          <td><input id="x_heimTipp" value="2"><input id="x_gastTipp" value="1"></td>
          <td>
            <span class="quote-heim"><span class="quote-text">45</span></span>
            <span class="quote-remis"><span class="quote-text">28</span></span>
            <span class="quote-gast"><span class="quote-text">27</span></span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
`;

describe('fetchBettingQuotes', () => {
  it('returns home, draw, and away quotes without current bet values', async () => {
    const data = await fetchBettingQuotes(fakePage(html), 'mycomm', 4);

    expect(data).toEqual({
      title: 'Tippabgabe - 4. Spieltag',
      matches: [{
        date: '12.09.25 20:30',
        home: 'Home Team',
        away: 'Away Team',
        odds: {
          home: '45',
          draw: '28',
          away: '27',
        },
      }],
    });
  });
});
