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
    })
    return () => ws.close()
  })
</script>

<svelte:head>
  <title>{domain.name}</title>
</svelte:head>

<h1>/domains/{domain.name}</h1>

<a href="/domains">&lt;-- back</a>

<h2>State</h2>

<p>
  Domain {domain.name || domain.id} is
  {#if domain.stateReason && domain.stateReason !== 'unknown'}
    {domain.state}, because {domain.stateReason}.
  {:else}{domain.state}.{/if}
</p>

<h2>Actions</h2>

<ul>
  {#each domain._links as link}
    <li>
      {#each link.actions as action}
        <Action {link} {action} />
      {/each}
    </li>
  {/each}
</ul>
