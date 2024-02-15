<script lang="ts">
  import { dbRoot } from "../constants";
  import { wikis } from "../utils";
  import { onMount } from "svelte";
  let searchParams: any = {};
  let foundReserves: any[] = [];
  let foundTotal: number = null, findLimit = 50, findPage = 1;
  let sort = null, sortByField = null;
  async function search(page?: number) {
    let search: any = {
      wikipage: `${searchParams.wikipage?.trim() ?? ""}`,
      title: `%${searchParams.title?.trim() ?? ""}%`,
      // date: `%${searchParams.date?.trim() ?? ""}%`,
    }
    if (searchParams.originWiki!="null") { search.originWiki = wikis[parseInt(searchParams.originWiki)].site; }
    if (searchParams.user) { search.user = searchParams.user.trim() }
    if (searchParams.userId) { search.userWikidotId = searchParams.userId.trim() }
    if (page) {
      search.limit = findLimit;
      search.page = page;
    } else {
      search.limit = searchParams.limit ?? 50;
      search.page = searchParams.page ?? 1;
    }
    let res = await fetch(dbRoot+"/search", {
      method: "POST",
      body: JSON.stringify(search),
      mode: "cors",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then(res=>res.json());
    sort = null;
    sortByField = null;
    if (res.status === "ok") {
      document.getElementById("search-error-message").innerText = '';
      foundReserves = res.data.data.map(v=>{ v.date=new Date(v.date); return v; });
      foundTotal = res.data.count;

      if (page) {
        findPage = page;
      } else {
        findLimit = searchParams.limit ?? 50;
        findPage = searchParams.page ?? 1;
      }

      // default sort by date desc
      sortByField = "date";
      sort = "desc";

    } else document.getElementById("search-error-message").innerText = res.message;
  }
  function strcmp(a: string, b: string) {return +(a > b) - +(a < b)};
  function numcmp(a: number, b: number) {return +(a > b) - +(a < b)};
  function sortBy(field: string, event?: Event) {
    let th = event?.target as HTMLElement;
    if (!th) {
      let el = document.getElementsByClassName(`transres-${field}`);
      if (!el.length) return;
      th = el[0] as HTMLElement;
    };
    if (th.classList.contains("sort-icon")) th = th.parentElement;
    if (sortByField === field) {
      foundReserves.reverse();
      sort = sort === "asc" ? "desc" : "asc";
    } else {
      switch (field.toLowerCase()) {
        case "user-id":
          foundReserves.sort((a, b)=>numcmp(a.user.wikidotId, b.user.wikidotId));
          break;
        case "user":
          foundReserves.sort((a, b)=>strcmp(a.user.name.toLowerCase(), b.user.name.toLowerCase()));
          break;
        case "page":
          foundReserves.sort((a, b)=>strcmp(a.page.toLowerCase(), b.page.toLowerCase()));
          break;
        case "title":
          foundReserves.sort((a, b)=>strcmp(a.title.toLowerCase(), b.title.toLowerCase()));
          break;
        case "date":
          foundReserves.sort((a, b)=>numcmp(a.date.valueOf(), b.date.valueOf()));
          break;
      
        default:
          break;
      }
      sort = "asc";
      sortByField = field;
    }
    foundReserves = foundReserves;
  }
  onMount(async()=>{
    await search();
  });
</script>

<div id="search-content">
  <form id="search-bar" on:submit|preventDefault={()=>search()}>
    <input id="transres-search" type="search" placeholder="以頁面網址尋找預定" bind:value="{searchParams.wikipage}">
    <button type="submit" class="btn search-btn">搜索</button>
    <br /><br />
    <div id="search-filters">
      <input class="transres-metadata-filter" type="text" name="user-id" placeholder="用戶ID" bind:value="{searchParams.userId}">
      <input class="transres-metadata-filter" type="text" name="user" placeholder="用戶名" bind:value="{searchParams.user}">
      <select class="transres-metadata-filter" name="orginWiki" bind:value="{searchParams.originWiki}">
        <option value="null">語言分部</option>
        {#each wikis as wiki, i}
          <option value={i}>{wiki.name}</option>
        {/each}
      </select>
      <input class="transres-metadata-filter" type="text" name="title" placeholder="標題" bind:value="{searchParams.title}">
      <br />
      <input class="transres-metadata-filter" type="number" name="limit" min="0" placeholder="每頁數量 (50)" bind:value="{searchParams.limit}">
      <input class="transres-metadata-filter" type="number" name="page" min="1" placeholder="分頁 (1)" bind:value="{searchParams.page}">
    </div>
  </form>
  
  <div id="search-error-message" />
  <div id="search-results">
    {#if foundTotal}
      {#if foundTotal > findLimit && findLimit!==0}
        <div class="page-btn-container">
          {#each [...new Set([1, 2, 3,
                              findPage-1, findPage, findPage+1,
                              Math.ceil(foundTotal/findLimit)-2, Math.ceil(foundTotal/findLimit)-1, Math.ceil(foundTotal/findLimit)])]
                  .sort((a,b)=>a-b).filter(v=>v>0&&v<=Math.ceil(foundTotal/findLimit)) as pagenumber}
            {#if pagenumber === findPage}
              <div class="page-btn active">{pagenumber}</div>
            {:else}
              <div class="btn page-btn" on:click={()=>search(pagenumber)}>{pagenumber}</div>
            {/if}
          {/each}
        </div>
      {/if}
      <table id="search-results-table">
        <tr>
          <th class="transres-metadata transres-user-id" on:click={(e)=>sortBy('user-id', e)} data-sort="{sortByField==="user-id" ? sort : ''}">
            預定用戶ID
            <span class="icon sort-icon" />
          </th>
          <th class="transres-metadata transres-user" on:click={(e)=>sortBy('user', e)} data-sort="{sortByField==="user" ? sort : ''}">
            預定用戶名
            <span class="icon sort-icon" />
          </th>
          <th class="transres-metadata transres-page" on:click={(e)=>sortBy('page', e)} data-sort="{sortByField==="page" ? sort : ''}">
            原文鏈接
            <span class="icon sort-icon" />
          </th>
          <th class="transres-metadata transres-title" on:click={(e)=>sortBy('title', e)} data-sort="{sortByField==="title" ? sort : ''}">
            標題
            <span class="icon sort-icon" />
          </th>
          <th class="transres-metadata transres-date" on:click={(e)=>sortBy('date', e)} data-sort="{sortByField==="date" ? sort : ''}">
            預定日期
            <span class="icon sort-icon" />
          </th>
        </tr>
        {#each foundReserves as transres}
          <tr data-transres-id={transres.id}>
            <td class="transres-user-id">{transres.user.wikidotId}</td>
            <td class="transres-user">{transres.user.name}</td>
            <td class="transres-page">
              {#if transres.originWiki}
                <a href={transres.originWiki+"/"+transres.page}>
                  {transres.originWiki+"/"+transres.page}
                </a>
              {:else}
                {transres.page}
              {/if}
            </td>
            <td class="transres-title">{transres.title}</td>
            <td class="transres-date" data-transres-created={transres.date.valueOf()}>
              {transres.date.getFullYear()}-{("0"+(transres.date.getMonth()+1)).slice(-2)}-{("0"+transres.date.getDate()).slice(-2)}
            </td>
          </tr>
        {/each}
      </table>
      {#if foundTotal > findLimit && findLimit!==0}
        <div class="page-btn-container">
          {#each [...new Set([1, 2, 3,
                              findPage-1, findPage, findPage+1,
                              Math.ceil(foundTotal/findLimit)-2, Math.ceil(foundTotal/findLimit)-1, Math.ceil(foundTotal/findLimit)])]
                  .sort((a,b)=>a-b).filter(v=>v>0&&v<=Math.ceil(foundTotal/findLimit)) as pagenumber}
            {#if pagenumber === findPage}
              <div class="page-btn active">{pagenumber}</div>
            {:else}
              <div class="btn page-btn" on:click={()=>search(pagenumber)}>{pagenumber}</div>
            {/if}
          {/each}
        </div>
      {/if}
    {:else if foundTotal === 0}
      <div id="no-results">
        <h3>無結果。</h3>
      </div>
    {/if}
  </div>
</div>


<style lang="scss">
  @media (prefers-color-scheme: dark) {
    #search-bar input, #search-bar select {
      background-color: var(--dark-bg);
      color: var(--dark-bg-text-color);
      &::placeholder {
        color: var(--dark-softer-text-color);
      }
    }a {
      color: var(--light-accent);
    }
    a:hover {
      color: var(--dark-accent);
    }
  }
  @media (prefers-color-scheme: light) {
    #search-bar input, #search-bar select {
      background-color: var(--light-bg);
      color: var(--light-bg-text-color);
      &::placeholder {
        color: var(--light-bg-soft-text-color);
      }
    }
    #search-results .page-btn.active {
      color: var(--light-bg-text-color);
    }
    a {
      color: var(--dark-accent);
    }
    a:hover {
      color: var(--light-accent);
    }
  }
  #search-bar {
    input {
      border: 1px solid #888;
      border-radius: 5px;
      padding: 4px 10px;
      width: 150px;
    }
    select {
      border: 1px solid #888;
      border-radius: 5px;
      padding: 4px 10px;
      width: 172px;
    }
    #transres-search {
      display: inline-block;
      padding: 0.375em 1.5em;
      font-size: 1.25em;
      width: 45%;
      border: 2.5px solid var(--light-accent);
      border-radius: 10px;
      box-shadow: none;
    }
    #search-filters {
      line-height: 2;
    }
  }
  #search-content {
    font-size: 1em;
    text-align: center;
  }
  #transres-search:focus-visible,
  #transres-search:focus,
  .search-btn:focus-visible,
  .search-btn:focus {
    outline: 2px solid var(--light-accent);
  }
  .search-btn {
    display: inline-block;
    color: #FFF;
    background-color: var(--light-accent);
    text-shadow: none;
    padding: 0.375em 1.5em;
    font-size: 1.25em;
    border: 2px solid var(--light-accent);
    border-radius: 10px;
    user-select: none;

    &:hover {
      background-color: var(--dark-accent);
      cursor: pointer;
    }
  }
  #search-results {
    text-align: center;
    display: inline-block;
    margin: 20px;

    .btn {
      cursor: pointer;
    }
    .page-btn {
      display: inline-block;
      color: #FFF;
      background-color: var(--light-accent);
      border: none;
      border-radius: 5px;
      padding: 0.375em 1.5em;
      margin: 2px;
      font-size: 16px;
      user-select: none;

      &:hover {
        background-color: var(--dark-accent);
      }

      &.active {
        background-color: transparent;
        border: 2px solid var(--light-accent);
        padding: calc(0.375em - 2px) calc(1.5em - 2px);
      }

      &.active:hover {
        background-color: transparent;
        border: 2px solid var(--dark-accent);
      }
    }
  }
  #search-results-table {
    // border-spacing: 10px;
    // border-collapse: collapse;
    tr {
      border: 2px solid #888;
      border-radius: 5px;
    }
    td, th {
      position: relative;
      border: 1px solid #888;
      border-radius: 5px;
      padding: 4px 10px;

      &.transres-user-id,
      &.transres-user,
      &.transres-date {
        width: 100px;
      }
      &.transres-page,
      &.transres-title {
        width: 250px;
      }
    }
    th {
      cursor: pointer;
      user-select: none;
    }
    .transres-metadata[data-sort="asc"] .sort-icon {
      background-color: #444;
      &::before {
        content: "△";
        position: absolute;
        right: 0.5em;
      }
    }
    .transres-metadata[data-sort="desc"] .sort-icon {
      background-color: #444;
      &::before {
        content: "▽";
        position: absolute;
        right: 0.5em;
      }
    }
  }
</style>