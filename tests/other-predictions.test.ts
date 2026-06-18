import { describe, expect, it } from 'vitest';
import { fetchOtherPredictions } from '../src/core.js';
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
    currentUrl: 'https://www.kicktipp.de/mycomm/tippuebersicht',
  } as unknown as Page;
}

const html = `
  <div id="kicktipp-content">
    <div class="pagetitle">Tippuebersicht - 3. Spieltag</div>
    <table id="spielplanSpiele">
      <tbody>
        <tr>
          <td>01.09.25 15:30</td>
          <td>Home A</td>
          <td>Away A</td>
          <td><span class="kicktipp-ergebnis"><span class="kicktipp-heim">2</span>:<span class="kicktipp-gast">1</span></span></td>
        </tr>
        <tr>
          <td>01.09.25 18:30</td>
          <td>Home B</td>
          <td>Away B</td>
          <td><span class="kicktipp-ergebnis"><span class="kicktipp-heim">0</span>:<span class="kicktipp-gast">0</span></span></td>
        </tr>
      </tbody>
    </table>
    <table id="ranking">
      <tbody>
        <tr class="teilnehmer" data-teilnehmer-id="11">
          <td class="position"><div>1.</div></td>
          <td class="positionsdifferenz position-icon-up"><span class="d1">2</span></td>
          <td class="mg_class"><div class="mg_name">Alice</div></td>
          <td class="nw t ereignis ereignis0">2:1<sub class="p">4</sub></td>
          <td class="nw f ereignis ereignis1">1:1</td>
          <td class="spieltagspunkte">4</td>
          <td class="bonus">8</td>
          <td class="siege">1,00</td>
          <td class="gesamtpunkte">42</td>
        </tr>
        <tr class="teilnehmer" data-teilnehmer-id="12">
          <td class="position"><div>2.</div></td>
          <td class="positionsdifferenz position-icon-down"><span class="d1">1</span></td>
          <td class="mg_class"><div class="mg_name">Bob</div></td>
          <td class="nw f ereignis ereignis0">1:0</td>
          <td class="nw ereignis ereignis1"></td>
          <td class="spieltagspunkte">0</td>
          <td class="bonus">4</td>
          <td class="siege"></td>
          <td class="gesamtpunkte">17</td>
        </tr>
      </tbody>
    </table>
  </div>
`;

describe('fetchOtherPredictions', () => {
  it('parses visible player predictions without merging points into the tip', async () => {
    const data = await fetchOtherPredictions(fakePage(html), 'mycomm', 3, {
      limit: 10,
      includeCurrentPlayer: true,
    });

    expect(data.matchday).toBe(3);
    expect(data.matches).toHaveLength(2);
    expect(data.players).toHaveLength(2);
    expect(data.players[0]).toMatchObject({
      participantId: '11',
      position: '1.',
      positionChange: { direction: 'up', value: '2' },
      name: 'Alice',
      matchdayPoints: '4',
      total: '42',
    });
    expect(data.players[0].predictions[0]).toMatchObject({
      home: 'Home A',
      away: 'Away A',
      result: '2:1',
      prediction: '2:1',
      points: '4',
      scored: true,
    });
    expect(data.players[1].predictions[1]).toMatchObject({
      prediction: null,
      points: '',
      scored: null,
    });
  });

  it('returns an offset when the requested limit stops inside a page', async () => {
    const data = await fetchOtherPredictions(fakePage(html), 'mycomm', 3, {
      limit: 1,
      includeCurrentPlayer: true,
    });

    expect(data.players.map((p) => p.name)).toEqual(['Alice']);
    expect(data.pagination).toMatchObject({
      requestedLimit: 1,
      returnedPlayers: 1,
      nextOffset: 1,
      hasMore: true,
    });
  });
});
