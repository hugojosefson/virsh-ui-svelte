<script context="module">
  export async function preload(page, { user }) {
    return { user }
  }
</script>

<script>
  export let user
</script>

<header style="text-align: right; float: right;">
  {#if user}
    <a href="/logout">Logout</a>
    <br />
    <br />
    <img src={user.picture} width="42" alt="Profile picture" />
    <br />
    {user.name}
    <br />
  {:else}
    <a href="/login">Login</a>
  {/if}
</header>
<slot />
