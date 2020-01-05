<script>
  import { createEventDispatcher } from 'svelte'

  export let link
  export let action

  const dispatch = createEventDispatcher()

  const performAction = action => async () => {
    const response = await fetch(action.href, { method: action.method })
    if (response.ok) {
      dispatch('result', { message: (await response.json()).message })
    } else {
      dispatch('result', {
        error: {
          status: response.status,
          statusText: response.statusText,
          body: await response.json()
        }
      })
    }
  }

</script>

<button on:click={performAction(action)}>{action.method} {link.rel}</button>
