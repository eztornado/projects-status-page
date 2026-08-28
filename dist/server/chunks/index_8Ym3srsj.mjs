import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { b as createAstro, f as renderHead, i as renderComponent, s as renderSlot, u as renderTemplate } from "./server_fBqW9pJv.mjs";
import { t as createComponent } from "./compiler_BU2MEOxy.mjs";
import React, { useEffect, useState } from "react";
import { ActionIcon, Box, Center, Container, Divider, Grid, Group, MantineProvider, Progress, SimpleGrid, Stack, Text, ThemeIcon, Title, Tooltip } from "@mantine/core";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as Tooltip$1, XAxis, YAxis } from "recharts";
import { IconActivity, IconAlertCircle, IconApi, IconChartBar, IconCheck, IconClock, IconCloud, IconDeviceDesktop, IconRefresh, IconServer, IconX } from "@tabler/icons-react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/hooks/useServiceMonitor.ts
function useServiceMonitor() {
	const [services, setServices] = useState([]);
	const [history, setHistory] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const fetchStatus = async () => {
		try {
			const data = await (await fetch("/api/status")).json();
			if (data.success && data.services) {
				setServices(data.services);
				setHistory((prevHistory) => {
					const newHistory = { ...prevHistory };
					data.services.forEach((service) => {
						const serviceName = service.name;
						const currentHistory = newHistory[serviceName] || [];
						newHistory[serviceName] = [...currentHistory, service.latency].slice(-20);
					});
					return newHistory;
				});
				setError(null);
			} else setError(data.error || "Error fetching service status");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchStatus();
		const interval = setInterval(fetchStatus, 1e4);
		return () => clearInterval(interval);
	}, []);
	return {
		services,
		history,
		loading,
		error,
		refetch: fetchStatus
	};
}
//#endregion
//#region src/components/status/StatusPage.tsx
function StatusPage() {
	const { services, history, loading, error, refetch } = useServiceMonitor();
	const chartData = React.useMemo(() => {
		return (history["API"] || []).map((latency, index) => ({
			time: `${index + 1}`,
			latency
		}));
	}, [history]);
	const systemStatus = React.useMemo(() => {
		if (services.length === 0) return {
			status: "unknown",
			percentage: 0,
			uptime: 0
		};
		const upCount = services.filter((s) => s.status === "up").length;
		const percentage = Math.round(upCount / services.length * 100);
		return {
			status: percentage === 100 ? "operational" : percentage > 50 ? "degraded" : "down",
			percentage,
			uptime: percentage
		};
	}, [services]);
	const getStatusIcon = (status) => {
		const props = {
			size: 32,
			variant: "light",
			radius: "xl"
		};
		if (status === "up") return /* @__PURE__ */ jsx(ThemeIcon, {
			...props,
			style: {
				background: "rgba(74, 222, 128, 0.15)",
				color: "#4ade80"
			},
			children: /* @__PURE__ */ jsx(IconCheck, { size: 16 })
		});
		return /* @__PURE__ */ jsx(ThemeIcon, {
			...props,
			style: {
				background: "rgba(248, 113, 113, 0.15)",
				color: "#f87171"
			},
			children: /* @__PURE__ */ jsx(IconX, { size: 16 })
		});
	};
	const getLatencyColor = (latency) => {
		if (latency < 100) return "#4ade80";
		if (latency < 200) return "#facc15";
		return "#f87171";
	};
	const getLatencyLabel = (latency) => {
		if (latency < 100) return "EXCELLENT";
		if (latency < 200) return "GOOD";
		if (latency < 500) return "ACCEPTABLE";
		return "SLOW";
	};
	const content = loading && services.length === 0 ? /* @__PURE__ */ jsx(Container, {
		size: "md",
		children: /* @__PURE__ */ jsxs(Stack, {
			align: "center",
			gap: "xl",
			py: "xl",
			children: [/* @__PURE__ */ jsx("div", {
				style: {
					background: "rgba(255, 255, 255, 0.08)",
					borderRadius: "16px",
					padding: "24px",
					border: "1px solid rgba(255, 255, 255, 0.15)"
				},
				children: /* @__PURE__ */ jsx(IconServer, {
					size: 48,
					style: { color: "#60a5fa" }
				})
			}), /* @__PURE__ */ jsxs(Stack, {
				gap: "xs",
				ta: "center",
				children: [/* @__PURE__ */ jsx(Title, {
					order: 2,
					style: { color: "var(--text-primary)" },
					children: "Loading Service Status..."
				}), /* @__PURE__ */ jsx(Text, {
					style: { color: "var(--text-secondary)" },
					children: "Checking service availability"
				})]
			})]
		})
	}) : error ? /* @__PURE__ */ jsx(Container, {
		size: "md",
		children: /* @__PURE__ */ jsxs(Stack, {
			align: "center",
			gap: "xl",
			py: "xl",
			children: [/* @__PURE__ */ jsx("div", {
				style: {
					background: "rgba(248, 113, 113, 0.15)",
					borderRadius: "16px",
					padding: "24px",
					border: "1px solid rgba(248, 113, 113, 0.3)"
				},
				children: /* @__PURE__ */ jsx(IconAlertCircle, {
					size: 48,
					style: { color: "#f87171" }
				})
			}), /* @__PURE__ */ jsxs(Stack, {
				gap: "xs",
				ta: "center",
				children: [/* @__PURE__ */ jsx(Title, {
					order: 2,
					style: { color: "#f87171" },
					children: "Connection Error"
				}), /* @__PURE__ */ jsx(Text, {
					style: { color: "var(--text-secondary)" },
					children: error
				})]
			})]
		})
	}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Container, {
			size: "lg",
			mb: "xl",
			children: /* @__PURE__ */ jsx("div", {
				style: {
					background: "rgba(255, 255, 255, 0.08)",
					borderRadius: "12px",
					padding: "20px",
					border: "1px solid rgba(255, 255, 255, 0.15)",
					backdropFilter: "blur(10px)"
				},
				children: /* @__PURE__ */ jsxs(Stack, {
					gap: "md",
					children: [
						/* @__PURE__ */ jsxs(Group, {
							justify: "space-between",
							align: "center",
							wrap: "nowrap",
							children: [/* @__PURE__ */ jsxs(Group, {
								gap: "md",
								children: [/* @__PURE__ */ jsx("div", {
									style: {
										background: "rgba(96, 165, 250, 0.2)",
										borderRadius: "10px",
										padding: "8px",
										border: "1px solid rgba(96, 165, 250, 0.3)"
									},
									children: /* @__PURE__ */ jsx(IconCloud, {
										size: 24,
										style: { color: "#60a5fa" }
									})
								}), /* @__PURE__ */ jsxs(Stack, {
									gap: 0,
									children: [/* @__PURE__ */ jsx(Title, {
										order: 1,
										size: "h1",
										style: {
											color: "var(--text-primary)",
											fontSize: "1.5rem"
										},
										children: "System Status"
									}), /* @__PURE__ */ jsx(Text, {
										style: {
											color: "var(--text-secondary)",
											fontSize: "0.85rem"
										},
										children: "Real-time monitoring for Reigreen Group services"
									})]
								})]
							}), /* @__PURE__ */ jsxs(Group, {
								gap: "xs",
								children: [/* @__PURE__ */ jsx(Tooltip, {
									label: "Refresh Status",
									children: /* @__PURE__ */ jsx(ActionIcon, {
										size: "lg",
										radius: "lg",
										variant: "light",
										onClick: refetch,
										style: {
											background: "rgba(255, 255, 255, 0.08)",
											border: "1px solid rgba(255, 255, 255, 0.15)"
										},
										children: /* @__PURE__ */ jsx(IconRefresh, {
											size: 16,
											style: { color: "var(--text-primary)" }
										})
									})
								}), /* @__PURE__ */ jsxs("div", {
									style: {
										background: systemStatus.status === "operational" ? "rgba(74, 222, 128, 0.2)" : systemStatus.status === "degraded" ? "rgba(250, 204, 21, 0.2)" : "rgba(248, 113, 113, 0.2)",
										borderRadius: "10px",
										padding: "6px 12px",
										border: `1px solid ${systemStatus.status === "operational" ? "rgba(74, 222, 128, 0.4)" : systemStatus.status === "degraded" ? "rgba(250, 204, 21, 0.4)" : "rgba(248, 113, 113, 0.4)"}`,
										display: "flex",
										alignItems: "center",
										gap: "6px"
									},
									children: [systemStatus.status === "operational" ? /* @__PURE__ */ jsx(IconActivity, {
										size: 16,
										style: { color: "#4ade80" }
									}) : /* @__PURE__ */ jsx(IconAlertCircle, {
										size: 16,
										style: { color: systemStatus.status === "degraded" ? "#facc15" : "#f87171" }
									}), /* @__PURE__ */ jsx(Text, {
										style: {
											color: systemStatus.status === "operational" ? "#4ade80" : systemStatus.status === "degraded" ? "#facc15" : "#f87171",
											fontWeight: 600,
											fontSize: "0.8rem"
										},
										children: systemStatus.status === "operational" ? "OPERATIONAL" : systemStatus.status === "degraded" ? "DEGRADED" : "DOWN"
									})]
								})]
							})]
						}),
						/* @__PURE__ */ jsx(Divider, { style: { borderColor: "rgba(255, 255, 255, 0.15)" } }),
						/* @__PURE__ */ jsxs(Grid, { children: [
							/* @__PURE__ */ jsx(Grid.Col, {
								span: {
									base: 12,
									sm: 4
								},
								children: /* @__PURE__ */ jsx("div", {
									style: {
										background: "rgba(255, 255, 255, 0.05)",
										borderRadius: "10px",
										padding: "12px",
										border: "1px solid rgba(255, 255, 255, 0.1)"
									},
									children: /* @__PURE__ */ jsxs(Stack, {
										gap: 6,
										children: [
											/* @__PURE__ */ jsx(Text, {
												size: "xs",
												style: {
													color: "var(--text-muted)",
													textTransform: "uppercase",
													letterSpacing: "0.05em",
													fontWeight: 600
												},
												children: "Uptime"
											}),
											/* @__PURE__ */ jsxs(Text, {
												size: "lg",
												fw: 700,
												style: {
													color: "var(--text-primary)",
													fontSize: "1.5rem"
												},
												children: [systemStatus.uptime, "%"]
											}),
											/* @__PURE__ */ jsx(Progress, {
												value: systemStatus.uptime,
												color: systemStatus.status === "operational" ? "#4ade80" : systemStatus.status === "degraded" ? "#facc15" : "#f87171",
												size: "xs",
												radius: "md"
											})
										]
									})
								})
							}),
							/* @__PURE__ */ jsx(Grid.Col, {
								span: {
									base: 12,
									sm: 4
								},
								children: /* @__PURE__ */ jsx("div", {
									style: {
										background: "rgba(255, 255, 255, 0.05)",
										borderRadius: "10px",
										padding: "12px",
										border: "1px solid rgba(255, 255, 255, 0.1)"
									},
									children: /* @__PURE__ */ jsxs(Stack, {
										gap: 6,
										children: [
											/* @__PURE__ */ jsx(Text, {
												size: "xs",
												style: {
													color: "var(--text-muted)",
													textTransform: "uppercase",
													letterSpacing: "0.05em",
													fontWeight: 600
												},
												children: "Active Services"
											}),
											/* @__PURE__ */ jsxs(Text, {
												size: "lg",
												fw: 700,
												style: {
													color: "var(--text-primary)",
													fontSize: "1.5rem"
												},
												children: [
													services.filter((s) => s.status === "up").length,
													" / ",
													services.length
												]
											}),
											/* @__PURE__ */ jsxs(Text, {
												size: "xs",
												style: { color: "var(--text-secondary)" },
												children: [
													services.filter((s) => s.status === "up").length,
													" online, ",
													services.filter((s) => s.status === "down").length,
													" offline"
												]
											})
										]
									})
								})
							}),
							/* @__PURE__ */ jsx(Grid.Col, {
								span: {
									base: 12,
									sm: 4
								},
								children: /* @__PURE__ */ jsx("div", {
									style: {
										background: "rgba(255, 255, 255, 0.05)",
										borderRadius: "10px",
										padding: "12px",
										border: "1px solid rgba(255, 255, 255, 0.1)"
									},
									children: /* @__PURE__ */ jsxs(Stack, {
										gap: 6,
										children: [
											/* @__PURE__ */ jsx(Text, {
												size: "xs",
												style: {
													color: "var(--text-muted)",
													textTransform: "uppercase",
													letterSpacing: "0.05em",
													fontWeight: 600
												},
												children: "Avg Latency"
											}),
											/* @__PURE__ */ jsxs(Text, {
												size: "lg",
												fw: 700,
												style: {
													color: "var(--text-primary)",
													fontSize: "1.5rem"
												},
												children: [services.filter((s) => s.status === "up").length > 0 ? Math.round(services.filter((s) => s.status === "up").reduce((acc, s) => acc + s.latency, 0) / services.filter((s) => s.status === "up").length) : 0, "ms"]
											}),
											/* @__PURE__ */ jsx(Text, {
												size: "xs",
												style: { color: "var(--text-secondary)" },
												children: "Across all services"
											})
										]
									})
								})
							})
						] })
					]
				})
			})
		}),
		/* @__PURE__ */ jsx(Container, {
			size: "lg",
			mb: "xl",
			children: /* @__PURE__ */ jsx(SimpleGrid, {
				cols: {
					base: 1,
					sm: 2,
					md: 3,
					lg: 4
				},
				spacing: "lg",
				children: services.map((service, index) => /* @__PURE__ */ jsx("div", {
					style: {
						background: "rgba(255, 255, 255, 0.08)",
						borderRadius: "12px",
						padding: "16px",
						border: "1px solid rgba(255, 255, 255, 0.15)",
						backdropFilter: "blur(10px)",
						transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
						cursor: "pointer",
						width: "100%",
						display: "flex",
						flexDirection: "column"
					},
					onMouseEnter: (e) => {
						e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
						e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.3)";
						e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
						e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
					},
					onMouseLeave: (e) => {
						e.currentTarget.style.transform = "translateY(0) scale(1)";
						e.currentTarget.style.boxShadow = "none";
						e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
						e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
					},
					children: /* @__PURE__ */ jsxs(Stack, {
						gap: "md",
						children: [
							/* @__PURE__ */ jsxs(Group, {
								justify: "space-between",
								align: "flex-start",
								children: [/* @__PURE__ */ jsxs(Stack, {
									gap: 4,
									children: [/* @__PURE__ */ jsxs(Group, {
										gap: "xs",
										children: [/* @__PURE__ */ jsx("div", {
											style: {
												background: service.status === "up" ? "rgba(74, 222, 128, 0.2)" : "rgba(248, 113, 113, 0.2)",
												borderRadius: "8px",
												padding: "6px",
												border: service.status === "up" ? "1px solid rgba(74, 222, 128, 0.4)" : "1px solid rgba(248, 113, 113, 0.4)"
											},
											children: /* @__PURE__ */ jsx(IconApi, {
												size: 14,
												style: { color: service.status === "up" ? "#4ade80" : "#f87171" }
											})
										}), /* @__PURE__ */ jsx(Text, {
											fw: 600,
											size: "md",
											style: { color: "var(--text-primary)" },
											children: service.name
										})]
									}), /* @__PURE__ */ jsx(Text, {
										size: "xs",
										style: {
											color: "var(--text-secondary)",
											fontFamily: "monospace"
										},
										children: service.url
									})]
								}), getStatusIcon(service.status)]
							}),
							/* @__PURE__ */ jsx(Divider, { style: { borderColor: "rgba(255, 255, 255, 0.1)" } }),
							/* @__PURE__ */ jsxs(Stack, {
								gap: "sm",
								children: [
									/* @__PURE__ */ jsxs(Group, {
										gap: "xs",
										children: [/* @__PURE__ */ jsxs("div", {
											style: {
												padding: "4px 10px",
												borderRadius: "6px",
												background: service.status === "up" ? "rgba(74, 222, 128, 0.2)" : "rgba(248, 113, 113, 0.2)",
												border: service.status === "up" ? "1px solid rgba(74, 222, 128, 0.4)" : "1px solid rgba(248, 113, 113, 0.4)",
												display: "flex",
												alignItems: "center",
												gap: "4px"
											},
											children: [service.status === "up" ? /* @__PURE__ */ jsx(IconCheck, {
												size: 12,
												style: { color: "#4ade80" }
											}) : /* @__PURE__ */ jsx(IconX, {
												size: 12,
												style: { color: "#f87171" }
											}), /* @__PURE__ */ jsx(Text, {
												size: "xs",
												fw: 600,
												style: {
													color: service.status === "up" ? "#4ade80" : "#f87171",
													fontSize: "0.7rem"
												},
												children: service.status === "up" ? "ONLINE" : "OFFLINE"
											})]
										}), service.status === "up" && /* @__PURE__ */ jsx("div", {
											style: {
												padding: "4px 10px",
												borderRadius: "6px",
												background: `rgba(${getLatencyColor(service.latency) === "#4ade80" ? "74, 222, 128" : getLatencyColor(service.latency) === "#facc15" ? "250, 204, 21" : "248, 113, 113"}, 0.15)`,
												border: `1px solid rgba(${getLatencyColor(service.latency) === "#4ade80" ? "74, 222, 128" : getLatencyColor(service.latency) === "#facc15" ? "250, 204, 21" : "248, 113, 113"}, 0.3)`
											},
											children: /* @__PURE__ */ jsx(Text, {
												size: "xs",
												fw: 500,
												style: {
													color: getLatencyColor(service.latency),
													fontSize: "0.65rem"
												},
												children: getLatencyLabel(service.latency)
											})
										})]
									}),
									service.status === "up" && /* @__PURE__ */ jsxs(Stack, {
										gap: "xs",
										children: [/* @__PURE__ */ jsxs(Group, {
											gap: "xs",
											justify: "space-between",
											children: [/* @__PURE__ */ jsxs(Group, {
												gap: "xs",
												children: [/* @__PURE__ */ jsx(IconClock, {
													size: 12,
													style: { color: "var(--text-muted)" }
												}), /* @__PURE__ */ jsx(Text, {
													size: "xs",
													style: { color: "var(--text-secondary)" },
													children: "Latency:"
												})]
											}), /* @__PURE__ */ jsxs(Text, {
												size: "xs",
												fw: 700,
												style: { color: getLatencyColor(service.latency) },
												children: [service.latency, "ms"]
											})]
										}), /* @__PURE__ */ jsx("div", {
											style: {
												position: "relative",
												height: "4px",
												background: "rgba(255, 255, 255, 0.1)",
												borderRadius: "3px",
												overflow: "hidden"
											},
											children: /* @__PURE__ */ jsx("div", { style: {
												position: "absolute",
												top: 0,
												left: 0,
												height: "100%",
												width: `${Math.min(service.latency / 5, 100)}%`,
												background: getLatencyColor(service.latency),
												transition: "width 0.3s ease",
												borderRadius: "3px"
											} })
										})]
									}),
									/* @__PURE__ */ jsx(Group, {
										gap: "xs",
										children: /* @__PURE__ */ jsxs(Text, {
											size: "xs",
											style: { color: "var(--text-muted)" },
											children: ["Updated: ", new Date(service.lastCheck).toLocaleTimeString()]
										})
									})
								]
							})
						]
					})
				}, index))
			})
		}),
		/* @__PURE__ */ jsx(Container, {
			size: "lg",
			mb: "xl",
			children: /* @__PURE__ */ jsx("div", {
				style: {
					background: "rgba(255, 255, 255, 0.08)",
					borderRadius: "12px",
					padding: "20px",
					border: "1px solid rgba(255, 255, 255, 0.15)",
					backdropFilter: "blur(10px)"
				},
				children: /* @__PURE__ */ jsxs(Stack, {
					gap: "md",
					children: [
						/* @__PURE__ */ jsxs(Group, {
							justify: "space-between",
							align: "center",
							children: [/* @__PURE__ */ jsxs(Group, {
								gap: "sm",
								children: [/* @__PURE__ */ jsx("div", {
									style: {
										background: "rgba(96, 165, 250, 0.2)",
										borderRadius: "8px",
										padding: "6px",
										border: "1px solid rgba(96, 165, 250, 0.3)"
									},
									children: /* @__PURE__ */ jsx(IconChartBar, {
										size: 16,
										style: { color: "#60a5fa" }
									})
								}), /* @__PURE__ */ jsx(Title, {
									order: 3,
									style: {
										color: "var(--text-primary)",
										fontSize: "1.2rem"
									},
									children: "Latency History - API"
								})]
							}), /* @__PURE__ */ jsxs(Group, {
								gap: "xs",
								children: [/* @__PURE__ */ jsx("div", {
									style: {
										padding: "4px 8px",
										borderRadius: "6px",
										background: "rgba(74, 222, 128, 0.15)",
										border: "1px solid rgba(74, 222, 128, 0.3)"
									},
									children: /* @__PURE__ */ jsx(Text, {
										size: "xs",
										style: {
											color: "#4ade80",
											fontSize: "0.65rem",
											fontWeight: 600
										},
										children: "LAST 20 CHECKS"
									})
								}), /* @__PURE__ */ jsx("div", {
									style: {
										padding: "4px 8px",
										borderRadius: "6px",
										background: "rgba(96, 165, 250, 0.15)",
										border: "1px solid rgba(96, 165, 250, 0.3)"
									},
									children: /* @__PURE__ */ jsx(Text, {
										size: "xs",
										style: {
											color: "#60a5fa",
											fontSize: "0.65rem",
											fontWeight: 600
										},
										children: "REAL-TIME"
									})
								})]
							})]
						}),
						/* @__PURE__ */ jsx(Divider, { style: { borderColor: "rgba(255, 255, 255, 0.1)" } }),
						/* @__PURE__ */ jsx(Box, {
							style: { height: "350px" },
							children: chartData.length > 0 ? /* @__PURE__ */ jsx(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ jsxs(AreaChart, {
									data: chartData,
									margin: {
										top: 10,
										right: 10,
										left: 0,
										bottom: 0
									},
									children: [
										/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
											id: "colorLatency",
											x1: "0",
											y1: "0",
											x2: "0",
											y2: "1",
											children: [/* @__PURE__ */ jsx("stop", {
												offset: "5%",
												stopColor: "#4ade80",
												stopOpacity: .3
											}), /* @__PURE__ */ jsx("stop", {
												offset: "95%",
												stopColor: "#4ade80",
												stopOpacity: 0
											})]
										}) }),
										/* @__PURE__ */ jsx(CartesianGrid, {
											strokeDasharray: "3 3",
											stroke: "rgba(255, 255, 255, 0.1)",
											vertical: false
										}),
										/* @__PURE__ */ jsx(XAxis, {
											dataKey: "time",
											stroke: "rgba(255, 255, 255, 0.3)",
											axisLine: false,
											tickLine: false,
											tick: {
												fill: "rgba(255, 255, 255, 0.5)",
												fontSize: 12
											},
											hide: true
										}),
										/* @__PURE__ */ jsx(YAxis, {
											stroke: "rgba(255, 255, 255, 0.3)",
											axisLine: false,
											tickLine: false,
											tick: {
												fill: "rgba(255, 255, 255, 0.5)",
												fontSize: 12
											}
										}),
										/* @__PURE__ */ jsx(Tooltip$1, {
											contentStyle: {
												backgroundColor: "rgba(30, 60, 114, 0.95)",
												border: "1px solid rgba(255, 255, 255, 0.2)",
												borderRadius: "12px",
												boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
												color: "#ffffff",
												fontSize: "14px",
												backdropFilter: "blur(10px)"
											},
											itemStyle: { color: "#4ade80" }
										}),
										/* @__PURE__ */ jsx(Area, {
											type: "monotone",
											dataKey: "latency",
											stroke: "#4ade80",
											strokeWidth: 3,
											fill: "url(#colorLatency)",
											animationDuration: 800,
											activeDot: {
												r: 6,
												fill: "#4ade80",
												stroke: "rgba(74, 222, 128, 0.3)",
												strokeWidth: 2
											}
										})
									]
								})
							}) : /* @__PURE__ */ jsx(Center, {
								h: "100%",
								children: /* @__PURE__ */ jsxs(Stack, {
									align: "center",
									gap: "md",
									children: [/* @__PURE__ */ jsx("div", {
										style: {
											background: "rgba(96, 165, 250, 0.15)",
											borderRadius: "16px",
											padding: "20px",
											border: "1px solid rgba(96, 165, 250, 0.3)"
										},
										children: /* @__PURE__ */ jsx(IconActivity, {
											size: 40,
											style: { color: "#60a5fa" }
										})
									}), /* @__PURE__ */ jsx(Text, {
										size: "lg",
										style: { color: "var(--text-secondary)" },
										children: "No latency data available"
									})]
								})
							})
						})
					]
				})
			})
		}),
		/* @__PURE__ */ jsx(Container, {
			size: "lg",
			mb: "xl",
			children: /* @__PURE__ */ jsx("div", {
				style: {
					background: "rgba(255, 255, 255, 0.06)",
					borderRadius: "16px",
					padding: "20px 24px",
					border: "1px solid rgba(255, 255, 255, 0.12)",
					backdropFilter: "blur(10px)"
				},
				children: /* @__PURE__ */ jsxs(Group, {
					justify: "space-between",
					align: "center",
					wrap: "wrap",
					children: [/* @__PURE__ */ jsx(Group, {
						gap: "md",
						children: /* @__PURE__ */ jsxs(Group, {
							gap: "xs",
							children: [/* @__PURE__ */ jsx("div", {
								style: {
									background: "rgba(96, 165, 250, 0.2)",
									borderRadius: "8px",
									padding: "6px",
									border: "1px solid rgba(96, 165, 250, 0.3)"
								},
								children: /* @__PURE__ */ jsx(IconDeviceDesktop, {
									size: 16,
									style: { color: "#60a5fa" }
								})
							}), /* @__PURE__ */ jsx(Text, {
								size: "sm",
								style: { color: "var(--text-secondary)" },
								children: "© 2026 Reigreen Group. Automated service monitoring."
							})]
						})
					}), /* @__PURE__ */ jsxs(Group, {
						gap: "xs",
						children: [
							/* @__PURE__ */ jsx("div", {
								style: {
									padding: "6px 12px",
									borderRadius: "8px",
									background: "linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(96, 165, 250, 0.1))",
									border: "1px solid rgba(96, 165, 250, 0.3)"
								},
								children: /* @__PURE__ */ jsx(Text, {
									size: "xs",
									style: {
										color: "#60a5fa",
										fontSize: "0.75rem",
										fontWeight: 600
									},
									children: "v1.0"
								})
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									padding: "6px 12px",
									borderRadius: "8px",
									background: "rgba(74, 222, 128, 0.15)",
									border: "1px solid rgba(74, 222, 128, 0.3)"
								},
								children: /* @__PURE__ */ jsx(Text, {
									size: "xs",
									style: {
										color: "#4ade80",
										fontSize: "0.75rem",
										fontWeight: 600
									},
									children: "REAL-TIME"
								})
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									padding: "6px 12px",
									borderRadius: "8px",
									background: "rgba(168, 85, 247, 0.15)",
									border: "1px solid rgba(168, 85, 247, 0.3)"
								},
								children: /* @__PURE__ */ jsx(Text, {
									size: "xs",
									style: {
										color: "#a855f7",
										fontSize: "0.75rem",
										fontWeight: 600
									},
									children: "5 SERVICES"
								})
							})
						]
					})]
				})
			})
		})
	] });
	return /* @__PURE__ */ jsx(MantineProvider, { children: content });
}
//#endregion
//#region src/layouts/Layout.astro
createAstro("https://astro.build");
var $$Layout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Layout;
	const { title = "Status Page - Reigreen Group" } = Astro.props;
	return renderTemplate`<html lang="es" data-astro-cid-ju4pidww><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><meta name="description" content="Estado de los servicios de Reigreen Group"><link rel="stylesheet" href="/styles/global.css">${renderHead($$result)}</head><body data-astro-cid-ju4pidww><main data-astro-cid-ju4pidww>${renderSlot($$result, $$slots["default"])}</main></body></html>`;
}, "/home/ubuntu/status-page/src/layouts/Layout.astro", void 0);
//#endregion
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Estado del Sistema - Reigreen Group" }, { "default": ($$result) => renderTemplate`${renderComponent($$result, "StatusPage", StatusPage, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/home/ubuntu/status-page/src/components/status/StatusPage.tsx",
		"client:component-export": "default"
	})}` })}`;
}, "/home/ubuntu/status-page/src/pages/index.astro", void 0);
var $$file = "/home/ubuntu/status-page/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
