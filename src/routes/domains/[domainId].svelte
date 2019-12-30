<script context="module">
  export async function preload(page, session) {
    const { domainId } = page.params
    const domain = await this.fetch(`/api/domains/${domainId}`).then(res =>
      res.json()
    )
    return { domain }
  }
</script>

<script>
  import o2a from '../../fn/o2a'

  export let domain
  const post = href => () => fetch(href, { method: 'POST' })
</script>

<a href="/domains">&lt;-- back</a>

<h1>/domains/{domain.name}</h1>

<h2>State</h2>
Domain {domain.name || domain.id} is
{#if domain.stateReason}
  {domain.state}, because {domain.stateReason}.
{:else}{domain.state}.{/if}

<h2>Links</h2>
<ul>
  {#each o2a('rel', 'href')(domain._links) as link}
    <li>
      <a href={link.href}>view {link.rel}</a>
      <button on:click={post(link.href)}>do {link.rel}</button>
    </li>
  {/each}
</ul>
