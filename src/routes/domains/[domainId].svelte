<script context="module">
  export async function preload(page, session) {
    const {domainId} = page.params
    const domain = await this.fetch(`/api/domains/${domainId}`).then(res => res.json())
    return { domain }
  }
</script>

<script>
  export let domain
</script>

<a href="/domains">&lt;-- back</a>

<h1>/domains/{domain.data.attributes.name}</h1>

<code><pre>{JSON.stringify(domain, null, 2)}</pre></code>
