import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region src/config/services.ts
var services = [
	{
		name: "API",
		url: "https://api.reigreengroup.com",
		description: "API principal de Reigreen Group"
	},
	{
		name: "Clientes",
		url: "https://clientes.reigreengroup.com",
		description: "Portal de clientes"
	},
	{
		name: "Web",
		url: "https://reigreengroup.com",
		description: "Sitio web principal"
	},
	{
		name: "OCR",
		url: "https://ocr.reigreengroup.com",
		description: "Servicio de OCR"
	},
	{
		name: "Magika",
		url: "https://magika.reigreengroup.com",
		description: "Servicio de Magika"
	}
];
//#endregion
//#region src/lib/monitor.ts
async function checkService(service) {
	const startTime = Date.now();
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 1e4);
		const response = await fetch(service.url, {
			method: "GET",
			signal: controller.signal,
			redirect: "follow"
		});
		clearTimeout(timeoutId);
		const latency = Date.now() - startTime;
		return {
			name: service.name,
			url: service.url,
			status: response.ok ? "up" : "down",
			latency,
			lastCheck: /* @__PURE__ */ new Date()
		};
	} catch (error) {
		const latency = Date.now() - startTime;
		return {
			name: service.name,
			url: service.url,
			status: "down",
			latency,
			lastCheck: /* @__PURE__ */ new Date(),
			error: error instanceof Error ? error.message : "Unknown error"
		};
	}
}
async function checkAllServices(services) {
	const checks = services.map((service) => checkService(service));
	return Promise.all(checks);
}
//#endregion
//#region src/pages/api/status.ts
var status_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async () => {
	try {
		const serviceStatuses = await checkAllServices(services);
		return new Response(JSON.stringify({
			success: true,
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			services: serviceStatuses
		}), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-cache, no-store, must-revalidate"
			}
		});
	} catch (error) {
		return new Response(JSON.stringify({
			success: false,
			error: error instanceof Error ? error.message : "Unknown error"
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/status@_@ts
var page = () => status_exports;
//#endregion
export { page };
