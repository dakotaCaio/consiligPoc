import React, { useState, useEffect, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import useWhatsApps from "../../hooks/useWhatsApps";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
	},

	btnWrapper: {
		position: "relative",
	},

	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
}));

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
	email: Yup.string().email("Invalid email").required("Required"),
	cpfUser: Yup.string()
		.matches(/^[0-9]{11}$/, "CPF must be 11 digits"),
});

const UserModal = ({ open, onClose, userId }) => {
	const classes = useStyles();

	const initialState = {
		name: "",
		email: "",
		password: "",
		profile: "user",
		allTicket: "desabled",
		cpfUser: ""
	};

	const { user: loggedInUser } = useContext(AuthContext);

	const [userA, setUser] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [whatsappId, setWhatsappId] = useState(false);
	const { loading, whatsApps } = useWhatsApps();
	const [companies, setCompanies] = useState([]);
	const { user } = useContext(AuthContext);

	useEffect(() => {
		const fetchUser = async () => {
			if (!userId) return;
			try {
				const { data } = await api.get(`/users/${userId}`);
				setUser(prevState => {
					return { ...prevState, ...data };
				});
				const userQueueIds = data.queues?.map(queue => queue.id);
				setSelectedQueueIds(userQueueIds);
				setWhatsappId(data.whatsappId ? data.whatsappId : '');
			} catch (err) {
				toastError(err);
			}
		};

		fetchUser();
	}, [userId, open]);

	useEffect(() => {
    const fetchCompanies = async () => {
      try {
        if (user.companyId === 1) {
          const { data } = await api.get("/companies/list/");
          setCompanies(data);
        }
      } catch (error) {
        toastError(error);
      }
    }
    fetchCompanies();
  }, [])

	const handleClose = () => {
		onClose();
		setUser(initialState);
	};

	const handleSaveUser = async (values) => {
		const userData = {
			...values,
			whatsappId,
			queueIds: selectedQueueIds,
			allTicket: values.allTicket,
			companyId: user.companyId === 1 ? values.companyId : user.companyId, 
		};
	
		try {
			if (user.companyId !== 1 && user.companyId !== userData.companyId) {
				toast.error(i18n.t("users.toasts.noPermission"));
				return;
			}
	
			if (userId) {
				await api.put(`/users/${userId}`, userData);
			} else {
				await api.post("/users", userData);
			}
			toast.success(i18n.t("userModal.success"));
		} catch (err) {
			toastError(err);
		}
	
		handleClose();
	};
	
	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{userId
						? `${i18n.t("userModal.title.edit")}`
						: `${i18n.t("userModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={userA}
					enableReinitialize={true}
					validationSchema={UserSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveUser(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values, setFieldValue }) => (
						<Form>
							<DialogContent dividers>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.password")}
										type="password"
										name="password"
										error={touched.password && Boolean(errors.password)}
										helperText={touched.password && errors.password}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
								</div>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
									<Field
										as={TextField}
										label="CPF"
										name="cpfUser"
										error={touched.cpfUser && Boolean(errors.cpfUser)}
										helperText={touched.cpfUser && errors.cpfUser}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
									<FormControl
										variant="outlined"
										className={classes.formControl}
										margin="dense"
									>
										<Can
											role={loggedInUser.profile}
											perform="user-modal:editProfile"
											yes={() => (
												<>
													<InputLabel id="profile-selection-input-label">
														{i18n.t("userModal.form.profile")}
													</InputLabel>

													<Field
														as={Select}
														label={i18n.t("userModal.form.profile")}
														name="profile"
														labelId="profile-selection-label"
														id="profile-selection"
														required
													>
														<MenuItem value="admin">Admin</MenuItem>
														<MenuItem value="user">Operador</MenuItem>
													</Field>
												</>
											)}
										/>
									</FormControl>
								</div>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editQueues"
									yes={() => (
										<QueueSelect
											selectedQueueIds={selectedQueueIds}
											onChange={values => setSelectedQueueIds(values)}
										/>
									)}
								/>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editProfile"
									yes={() => (
										<FormControl variant="outlined" margin="dense" className={classes.maxWidth} fullWidth>
											<InputLabel>
												{i18n.t("userModal.form.whatsapp")}
											</InputLabel>
											<Field
												as={Select}
												value={whatsappId}
												onChange={(e) => setWhatsappId(e.target.value)}
												label={i18n.t("userModal.form.whatsapp")}

											>
												<MenuItem value={''}>&nbsp;</MenuItem>
												{whatsApps.map((whatsapp) => (
													<MenuItem key={whatsapp.id} value={whatsapp.id}>{whatsapp.name}</MenuItem>
												))}
											</Field>
										</FormControl>
									)}
								/>
								<div>
  {user.companyId === 1 && (
    <FormControl margin="dense" variant="outlined" fullWidth>
      <InputLabel>{i18n.t("Selecionar uma carteira")}</InputLabel>
      <Select
        labelId="dialog-select-company-label"
        id="dialog-select-company"
        name="companyId"
        value={values.companyId || ""}
        onChange={(e) => setFieldValue("companyId", e.target.value)}
        label={i18n.t("Selecionar uma carteira")}
        fullWidth
      >
        {companies.map((company) => (
          <MenuItem key={company.id} value={company.id}>
            {company.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )}
</div>

								
								<div className={classes.divider}>
									<span className={classes.dividerText}>Liberações</span>
								</div>
								
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editProfile"
									yes={() => (!loading &&
										<div className={classes.textField}>
											<FormControl
												variant="outlined"
												className={classes.maxWidth}
												margin="dense"
												fullWidth
											>
												<>
													<InputLabel id="profile-selection-input-label">
														{i18n.t("userModal.form.allTicket")}
													</InputLabel>

													<Field
														as={Select}
														label={i18n.t("allTicket.form.viewTags")}
														name="allTicket"
														labelId="allTicket-selection-label"
														id="allTicket-selection"
														required
													>
														<MenuItem value="enabled">{i18n.t("userModal.form.allTicketEnabled")}</MenuItem>
														<MenuItem value="desabled">{i18n.t("userModal.form.allTicketDesabled")}</MenuItem>
													</Field>
												</>
											</FormControl>
										</div>

									)}
								/>
								
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									style={{ borderColor: "#e22e00", color: "#e22e00", fontWeight: "bold" }}
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("userModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
									style={{ fontWeight: "bold"}}
								>
									{userId
										? `${i18n.t("userModal.buttons.okEdit")}`
										: `${i18n.t("userModal.buttons.okAdd")}`}
									{isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									)}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default UserModal;
