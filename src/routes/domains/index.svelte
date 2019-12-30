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
  import { onMount } from 'svelte'
  import { arrayifyCollection } from '../../fn/normalize-response'
  import createReload from '../../fn/create-reload'

  export let _domains
  let domains
  $: domains = arrayifyCollection(_domains)

  onMount(
    createReload(preload, [], preloaded => {
      _domains = preloaded._domains
    })
  )
</script>

<a href="/">&lt;-- back</a>

<h1>/domains</h1>

<ul>
  {#each domains as domain}
    <li>
      [ {domain.state} ] &nbsp;
      <a href={`/domains/${domain.id}`}>{domain.name}</a>
    </li>
  {/each}
</ul>
