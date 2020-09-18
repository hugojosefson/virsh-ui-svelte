<script context="module">
  import { json, normalize } from '../../fn/normalize-response'

  export async function preload(page, session) {
    const _networks = await this.fetch(`/api/networks`)
      .then(json)
      .then(normalize(this.fetch))
    return { _networks }
  }
</script>

<script>
  import ReconnectingWebSocket from 'reconnecting-websocket'
  import { onMount } from 'svelte'
  import { arrayifyCollection } from '../../fn/normalize-response'

  export let _networks
  let network
  $: network = arrayifyCollection(_networks)

  onMount(() => {
    const ws = new ReconnectingWebSocket(
      window.location.origin.replace(/^http/, 'ws') + '/api/networks'
    )
    ws.addEventListener('message', async event => {
      _networks = await Promise.resolve(event.data)
        .then(JSON.parse)
        .then(normalize(fetch))
    })
    return () => ws.close()
  })
</script>

<svelte:head>
  <title>/networks</title>
</svelte:head>

<h1>/networks</h1>
<p><a href="/">&lt;-- back</a></p>

<table>
  {#each network as network}
    <tr>
      <td><a href={`/networks/${network.id}`}>{network.name}</a></td>
      <td><a href={`/networks/${network.id}`}>( {network.state} )</a></td>
    </tr>
  {/each}
</table>
