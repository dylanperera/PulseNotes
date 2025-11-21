import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MicIcon from "@mui/icons-material/Mic";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import Menu, { type MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { alpha, styled } from "@mui/material/styles";
import * as React from "react";

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
		marginTop: theme.spacing(1),
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
export default function SelectModelOptions() {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleStart = () => {
		setAnchorEl(null);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<div className="model-select">
			<Button
				id="demo-customized-button"
				aria-controls={open ? "demo-customized-menu" : undefined}
				aria-haspopup="true"
				aria-expanded={open ? "true" : undefined}
				variant="contained"
				disableElevation
				onClick={handleClick}
				endIcon={<KeyboardArrowDownIcon />}
				sx={{
					backgroundColor: "rgb(20, 20, 20)",
					color: "white",
					"&:hover": {
						backgroundColor: "rgb(40, 40, 40)",
					},
				}}
			>
				<b style={{ marginLeft: "8px" }}>Select Model</b>
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
				<MenuItem onClick={handleStart} disableRipple>
					<ListItemText
						primary="Llama 3.2"
						secondary="(Decides how long to think)"
					/>
				</MenuItem>
				<Divider sx={{ my: 0.5 }} />
				<MenuItem onClick={handleClose} disableRipple>
					<ListItemText
						primary="MediPhi-Clinical"
						secondary="(Thinks longer for better answers)"
					/>{" "}
				</MenuItem>
			</StyledMenu>
		</div>
	);
}
