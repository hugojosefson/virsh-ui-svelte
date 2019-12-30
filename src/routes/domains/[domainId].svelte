<script context="module">
  import { json, normalize } from '../../fn/normalize-response'

  export async function preload(page, session) {
    const { domainId } = page.params
    const domain = await this.fetch(`/api/domains/${domainId}`)
      .then(json)
      .then(normalize(this.fetch))

    return { domain }
  }
</script>

<script>
  import { onMount } from 'svelte'
  import createReload from '../../fn/create-reload'

  export let domain
  $: onMount(
    createReload(preload, [{ params: { domainId: domain.id } }], preloaded => {
      domain = preloaded.domain
    })
  )

  const perform = action => () =>
    fetch(action.href, { method: action.method }).then(response =>
      console.log(response)
    )
</script>

<a href="/domains">&lt;-- back</a>

<h1>/domains/{domain.name}</h1>

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
        <button on:click={perform(action)}>{action.method} {link.rel}</button>
      {/each}
    </li>
  {/each}
</ul>
