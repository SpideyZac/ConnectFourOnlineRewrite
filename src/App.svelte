<script>
	export let name;

	let rando;

	$: result = Math.round(rando) ? 'winner' : 'loser';

	function setRando() {
		rando = Math.random();
	}
</script>

<h1>Hello {name}!</h1>

<p>The random number is { rando }</p>

<hr>

<p>{ result }</p>
<button on:click={setRando}>Randomize</button>