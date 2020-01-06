<script context="module">
  import { json, normalize } from '../../fn/normalize-response'

  export async function preload(page, session) {
    const { domainId } = page.params
    const url = `/api/domains/${domainId}`
    const domain = await this.fetch(url)
      .then(json)
      .then(normalize(this.fetch))

    return { domain }
  }
</script>

<script>
  import ReconnectingWebSocket from 'reconnecting-websocket'
  import { onMount } from 'svelte'
  import s from '../../fn/s'
  import Action from '../../components/action.svelte'

  export let domain
  onMount(() => {
    const ws = new ReconnectingWebSocket(
      window.location.origin.replace(/^http/, 'ws') +
        `/api/domains/${domain.id}`
    )
    ws.addEventListener('message', async event => {
      domain = await Promise.resolve(event.data)
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
  <title>{domain.name}</title>
</svelte:head>

<p>
  <a href="/domains">&lt;-- back</a>
</p>

<h1>/domains/{domain.name}</h1>

<p>
  Domain {domain.name || domain.id} is {domain.state}.
</p>

<p>
  {#each domain._links as link}
    {#each link.actions as action}
      <Action on:result={handleActionResult} {link} {action} />
    {/each}
  {/each}
</p>

{#if actionResult.message}
  <p>
    {actionResult.message.replace(domain.id, domain.name)}{`${/\.$/.test(actionResult.message) ? '' : '.'}`}
  </p>
{/if}

{#if actionResult.error}
  <pre>{s(actionResult.error)}</pre>
{/if}
