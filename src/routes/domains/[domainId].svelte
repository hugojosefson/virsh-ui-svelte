<script context="module">
  import o2a from '../../fn/o2a'
  import { json, normalize } from '../../fn/normalize-response'

  export async function preload(page, session) {
    const links = _links =>
      o2a('rel', '...')(_links).filter(({ rel }) => rel !== 'self')

    const allowedMethods = href =>
      this.fetch(href, { method: 'OPTIONS' }).then(response =>
        (response.headers.get('Allow') || '').split(',')
      )

    const getActions = data =>
      Promise.all(
        links(data._links).map(async link => ({
          ...link,
          methods: (await allowedMethods(link.href)).filter(
            method => method !== 'OPTIONS'
          )
        }))
      )
    const { domainId } = page.params
    const domain = await this.fetch(`/api/domains/${domainId}`)
      .then(json)
      .then(normalize)

    const actions = await getActions(domain)

    return { domain, actions }
  }
</script>

<script>
  export let domain
  export let actions
  const doMethod = href => method => () =>
    fetch(href, { method }).then(response => console.log(response))
</script>

<a href="/domains">&lt;-- back</a>

<h1>/domains/{domain.name}</h1>

<h2>State</h2>
Domain {domain.name || domain.id} is
{#if domain.stateReason}
  {domain.state}, because {domain.stateReason}.
{:else}{domain.state}.{/if}

<h2>Actions</h2>

<ul>
  {#each actions as action}
    <li>
      {#each action.methods as method}
        <button on:click={doMethod(action.href)(method)}>
          {method} {action.rel}
        </button>
      {/each}
    </li>
  {/each}
</ul>
