<script lang="ts">
  let pagename = document.referrer.split(/https?:\/\/[^/]*\/?/).join("");
  for (var i = 0; i < pagename.length; i++) {
    if (pagename.charAt(i) == "/" || pagename.charAt(i) == "#") break;
  }
  pagename = pagename.slice(0, i);
</script>

<div>
  <span>kekw</span>
</div>

<style lang="scss">
  .k {
    font-size: initial;
  }
</style>