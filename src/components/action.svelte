<script>
  import s from '../fn/s'

  export let link
  export let action
  let message

  const perform = action => async () => {
    const response = await fetch(action.href, { method: action.method })
    console.log(response)

    if (response.ok) {
      message = (await response.json()).message
    } else {
      message = {
        status: response.status,
        statusText: response.statusText,
        body: await response.json()
      }
    }

  }
</script>

<button on:click={perform(action)}>{action.method} {link.rel}</button>

{#if message}
  <pre>{s(message)}</pre>
{/if}
