<template>
	<div id="app">
		<div class="box">
			<li v-for="img in imgs" :key="img">
				<img v-lazy="img" />
			</li>
		</div>
	</div>
</template>

<script>
export default {
	name: "App",

	data() {
		return {
			imgs: [],
		};
	},
	created() {
		axios.get("http://localhost:3000/api/img").then(({ data }) => {
			this.imgs = data;
		});
	},
};
</script>

<style>
.box {
	height: 300px;
	overflow: scroll;
	width: 200px;
}
img {
	width: 100px;
	height: 100px;
}
</style>
