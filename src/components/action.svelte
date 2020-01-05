<script>
  import { createEventDispatcher } from 'svelte'
  import Icon from './feather-icon.svelte'

  const findIconName = (rel = '') => {
    const lc = rel.toLowerCase()
    return {
      start: 'play',
      stop: 'square',
    }[lc]
  }

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
          body: await response.json(),
        },
      })
    }
  }

  export let link
  export let action
  let name, buttonText
  $: name = findIconName(action && action.rel)
  $: buttonText = link.rel.toUpperCase()

  const options = { fill: '#222', style: 'vertical-align: middle' }
</script>

<style>
  .action {
    cursor: pointer;

    min-width: 100px;
    background: #efefef;
    border-radius: 5px;
    box-shadow: 2px 2px 10px 1px rgba(0, 0, 0, 0.1);
    padding: 10px;
  }
  .button-text {
    vertical-align: middle;
    font-weight: bold;
    margin-left: 3px;
  }
</style>

<button class="action" on:click={performAction(action)}>
  <Icon {name} {options} />
  <span class="button-text">{buttonText}</span>
</button>
