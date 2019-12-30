<script context="module">
  export async function preload(page, session) {
    const domains = await this.fetch('/api/domains').then(res => res.json())
    return { domains }
  }
</script>

<script>
  export let domains
</script>

<a href="/">&lt;-- back</a>

<h1>/domains</h1>

<ul>
  {#each domains.domains as domain}
    <li>
      [ {domain.state} ] &nbsp;
      <a href={`/domains/${domain.id}`}>{domain.name}</a>
    </li>
  {/each}
</ul>
