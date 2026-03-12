import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import Menu, { type MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { alpha, styled } from "@mui/material/styles";
import { jsPDF } from "jspdf";
import * as React from "react";

type ExportButtonProps = {
	htmlContent: string;
	patientName: string;
	dateTime: string;
};

type TextSegment = {
	text: string;
	bold: boolean;
	italic: boolean;
	underline: boolean;
};

function isContentEmpty(html: string): boolean {
	if (!html) return true;
	const tmp = document.createElement("div");
	tmp.innerHTML = html;
	return (tmp.textContent?.trim().length ?? 0) === 0;
}

function extractSegments(
	node: Node,
	bold = false,
	italic = false,
	underline = false,
): TextSegment[] {
	const segments: TextSegment[] = [];

	if (node.nodeType === Node.TEXT_NODE) {
		const text = node.textContent || "";
		if (text) {
			segments.push({ text, bold, italic, underline });
		}
		return segments;
	}

	if (node.nodeType !== Node.ELEMENT_NODE) return segments;

	const el = node as HTMLElement;
	const tag = el.tagName.toLowerCase();

	let b = bold;
	let i = italic;
	let u = underline;
	if (tag === "strong" || tag === "b") b = true;
	if (tag === "em" || tag === "i") i = true;
	if (tag === "u") u = true;

	if (tag === "br") {
		segments.push({ text: "\n", bold: false, italic: false, underline: false });
	} else {
		for (const child of Array.from(el.childNodes)) {
			segments.push(...extractSegments(child, b, i, u));
		}
	}

	return segments;
}

function exportToPdf(html: string, patientName: string, dateTime: string) {
	const doc = new jsPDF({ unit: "pt", format: "letter" });
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const margin = 54;
	const maxWidth = pageWidth - 2 * margin;
	const fontSize = 12;
	const lineHeight = fontSize * 1.6;

	let cursorX = margin;
	let cursorY = margin + fontSize;

	// --- Header ---
	const headerFontSize = 16;
	const subHeaderFontSize = 11;

	if (patientName) {
		doc.setFont("Helvetica", "bold");
		doc.setFontSize(headerFontSize);
		doc.text(patientName, margin, cursorY);
		cursorY += headerFontSize * 1.4;
	}

	if (dateTime) {
		doc.setFont("Helvetica", "normal");
		doc.setFontSize(subHeaderFontSize);
		doc.setTextColor(100, 100, 100);
		doc.text(dateTime, margin, cursorY);
		cursorY += subHeaderFontSize * 1.4;
	}

	if (patientName || dateTime) {
		cursorY += 4;
		doc.setDrawColor(200, 200, 200);
		doc.setLineWidth(0.75);
		doc.line(margin, cursorY, margin + maxWidth, cursorY);
		cursorY += lineHeight;
	}

	doc.setTextColor(0, 0, 0);

	const container = document.createElement("div");
	container.innerHTML = html;

	function applyFont(seg: TextSegment) {
		let style = "normal";
		if (seg.bold && seg.italic) style = "bolditalic";
		else if (seg.bold) style = "bold";
		else if (seg.italic) style = "italic";
		doc.setFont("Helvetica", style);
		doc.setFontSize(fontSize);
	}

	function newLine() {
		cursorX = margin;
		cursorY += lineHeight;
		if (cursorY > pageHeight - margin) {
			doc.addPage();
			cursorY = margin + fontSize;
		}
	}

	function renderSegments(segments: TextSegment[]) {
		for (const seg of segments) {
			if (seg.text === "\n") {
				newLine();
				continue;
			}

			applyFont(seg);

			const tokens = seg.text.split(/( +)/);
			for (const token of tokens) {
				if (!token) continue;
				const tokenWidth = doc.getTextWidth(token);

				if (cursorX + tokenWidth > margin + maxWidth && cursorX > margin) {
					newLine();
					if (token.trim() === "") continue;
				}

				doc.text(token, cursorX, cursorY);

				if (seg.underline && token.trim()) {
					doc.setDrawColor(0, 0, 0);
					doc.setLineWidth(0.5);
					const trimmedWidth = doc.getTextWidth(token.trimEnd());
					doc.line(cursorX, cursorY + 2, cursorX + trimmedWidth, cursorY + 2);
				}

				cursorX += tokenWidth;
			}
		}
	}

	for (const child of Array.from(container.childNodes)) {
		if (child.nodeType === Node.ELEMENT_NODE) {
			const tag = (child as HTMLElement).tagName.toLowerCase();
			const segments = extractSegments(child);

			if (tag === "p") {
				if (segments.length > 0) {
					renderSegments(segments);
				}
				newLine();
			} else {
				if (segments.length > 0) {
					renderSegments(segments);
				}
			}
		} else {
			const segments = extractSegments(child);
			if (segments.length > 0) {
				renderSegments(segments);
			}
		}
	}

	doc.save("summary.pdf");
}

function exportToWord(html: string, patientName: string, dateTime: string) {
	const headerHtml = `
		${patientName ? `<h2 style="margin:0 0 2px 0; font-size:16pt; color:#000;">${patientName}</h2>` : ""}
		${dateTime ? `<p style="margin:0 0 8px 0; font-size:11pt; color:#646464;">${dateTime}</p>` : ""}
		${patientName || dateTime ? '<hr style="border:none; border-top:1px solid #c8c8c8; margin-bottom:12px;" />' : ""}`;

	const fullHtml = `
		<html xmlns:o="urn:schemas-microsoft-com:office:office"
		      xmlns:w="urn:schemas-microsoft-com:office:word"
		      xmlns="http://www.w3.org/TR/REC-html40">
		<head><meta charset="utf-8">
		<style>
			body { font-family: Arial, Helvetica, sans-serif; font-size: 12pt; line-height: 1.6; color: #000; }
		</style>
		</head>
		<body>${headerHtml}${html}</body>
		</html>`;

	const blob = new Blob(["\ufeff", fullHtml], { type: "application/msword" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "summary.doc";
	link.click();
	URL.revokeObjectURL(url);
}

const StyledMenu = styled((props: MenuProps) => (
	<Menu
		elevation={0}
		anchorOrigin={{
			vertical: "bottom",
			horizontal: "right",
		}}
		transformOrigin={{
			vertical: "top",
			horizontal: "right",
		}}
		{...props}
	/>
))(({ theme }) => ({
	"& .MuiPaper-root": {
		borderRadius: 6,
		minWidth: 180,
		color: "rgb(33, 63, 33)",
		boxShadow:
			"rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
		"& .MuiMenu-list": {
			padding: "4px 0",
		},
		"& .MuiMenuItem-root": {
			"& .MuiSvgIcon-root": {
				fontSize: 18,
				color: theme.palette.text.secondary,
				marginRight: theme.spacing(1.5),
				...theme.applyStyles("dark", {
					color: "inherit",
				}),
			},
			"&:active": {
				backgroundColor: alpha(
					theme.palette.primary.main,
					theme.palette.action.selectedOpacity,
				),
			},
		},
		...theme.applyStyles("dark", {
			color: theme.palette.grey[300],
		}),
	},
}));

export default function ExportButton({ htmlContent, patientName, dateTime }: ExportButtonProps) {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleExportWord = () => {
		setAnchorEl(null);
		if (isContentEmpty(htmlContent)) return;
		exportToWord(htmlContent, patientName, dateTime);
	};

	const handleExportPdf = () => {
		setAnchorEl(null);
		if (isContentEmpty(htmlContent)) return;
		exportToPdf(htmlContent, patientName, dateTime);
	};

	const disabled = isContentEmpty(htmlContent);

	return (
		<div style={{ marginTop: "4px" }}>
			<Button
				id="demo-customized-button"
				aria-controls={open ? "demo-customized-menu" : undefined}
				aria-haspopup="true"
				aria-expanded={open ? "true" : undefined}
				variant="contained"
				disableElevation
				onClick={handleClick}
				endIcon={<KeyboardArrowDownIcon />}
				disabled={disabled}
				sx={{
					backgroundColor: "#244A82",
					color: "white",
					"&:hover": {
						backgroundColor: "rgb(40, 40, 40)",
					},
					"&.Mui-disabled": {
						backgroundColor: "#7a8ea8",
						color: "rgba(255,255,255,0.6)",
					},
				}}
			>
				<DownloadForOfflineIcon style={{ marginRight: "0.6rem" }} />
				<b style={{ marginLeft: "8px" }}>Export</b>
			</Button>
			<StyledMenu
				id="demo-customized-menu"
				slotProps={{
					list: {
						"aria-labelledby": "demo-customized-button",
					},
				}}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
			>
				<MenuItem onClick={handleExportWord} disableRipple>
					<ListItemText primary=".Word" />
				</MenuItem>
				<Divider sx={{ my: 0.5 }} />
				<MenuItem onClick={handleExportPdf} disableRipple>
					<ListItemText primary=".PDF" />
				</MenuItem>
			</StyledMenu>
		</div>
	);
}
