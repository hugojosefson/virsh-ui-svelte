<script context="module">
  import { json, normalize } from '../../fn/normalize-response'

  export async function preload(page, session) {
    const { networkId } = page.params
    const url = `/api/networks/${networkId}`
    const network = await this.fetch(url).then(json).then(normalize(this.fetch))

    return { network }
  }
</script>

<script>
  import ReconnectingWebSocket from 'reconnecting-websocket'
  import { onMount } from 'svelte'
  import s from '../../fn/s'
  import Action from '../../components/action.svelte'

  export let network
  onMount(() => {
    const ws = new ReconnectingWebSocket(
      window.location.origin.replace(/^http/, 'ws') +
        `/api/networks/${network.id}`
    )
    ws.addEventListener('message', async event => {
      network = await Promise.resolve(event.data)
        .then(JSON.parse)
        .then(normalize(fetch))
      handleActionResult()
    })
    return () => ws.close()
  })

  let actionResult = {}
  const handleActionResult = ({ detail } = {}) => {
    actionResult = detail || {}
  }
</script>

<svelte:head>
  <title>{network.name}</title>
</svelte:head>

<p><a href="/networks">&lt;-- back</a></p>

<h1>/networks/{network.name}</h1>

<p>Network {network.name || network.id} is {network.state}.</p>

<p>
  {#each network._links as link}
    {#each link.actions as action}
      <Action on:result={handleActionResult} {link} {action} />
    {/each}
  {/each}
</p>

{#if actionResult.message}
  <p>
    {actionResult.message.replace(network.id, network.name)}{`${/\.$/.test(actionResult.message) ? '' : '.'}`}
  </p>
{/if}

{#if actionResult.error}
  <pre>{s(actionResult.error)}</pre>
{/if}
