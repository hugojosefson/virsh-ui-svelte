<script context="module">
  import { json, normalize } from '../../fn/normalize-response'

  export async function preload(page, session) {
    const fetchFn = window && window.fetch || this.fetch
    const { domainId } = page.params
    const domain = await fetchFn(`/api/domains/${domainId}`)
      .then(json)
      .then(normalize(fetchFn))

    return { domain }
  }
</script>

<script>
  export let domain
  let domainId
  $: domainId = domain.id

  const perform = action => () =>
    fetch(action.href, { method: action.method }).then(response =>
      console.log(response)
    )

  const reload = async () => {
    domain = (await preload({ params: { domainId } })).domain
  }
</script>

<a href="/domains">&lt;-- back</a>

<h1>/domains/{domain.name}</h1>

<h2>State</h2>

<p>

<button on:click={reload}>reload</button>

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
