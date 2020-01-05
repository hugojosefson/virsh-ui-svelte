<script>
  import feather from 'feather-icons'

  export let name
  export let options

  let icon
  $: icon = (feather.icons[name] && feather.icons[name].toSvg(options)) || ''
</script>

<span>
  {@html icon}
</span>
