<script context="module">
  import { json, normalize } from '../../fn/normalize-response'

  export async function preload(page, session) {
    const _domains = await this.fetch(`/api/domains`)
      .then(json)
      .then(normalize(this.fetch))
    return { _domains }
  }
</script>

<script>
  import ReconnectingWebSocket from 'reconnecting-websocket'
  import { onMount } from 'svelte'
  import { arrayifyCollection } from '../../fn/normalize-response'

  export let _domains
  let domain
  $: domain = arrayifyCollection(_domains)

  onMount(() => {
    const ws = new ReconnectingWebSocket(
      window.location.origin.replace(/^http/, 'ws') + '/api/domains'
    )
    ws.addEventListener('message', async event => {
      _domains = await Promise.resolve(event.data)
        .then(JSON.parse)
        .then(normalize(fetch))
    })
    return () => ws.close()
  })
</script>

<svelte:head>
  <title>/domains</title>
</svelte:head>

<h1>/domains</h1>
<p>
  <a href="/">&lt;-- back</a>
</p>

<table>
  {#each domain as domain}
    <tr>
      <td>
        <a href={`/domains/${domain.id}`}>{domain.name}</a>
      </td>
      <td>
        <a href={`/domains/${domain.id}`}>( {domain.state} )</a>
      </td>
    </tr>
  {/each}
</table>
