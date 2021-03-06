import {useStyles as useModalStyles} from "./modal.styles";
import * as React from "react";
import {useEffect, useState} from "react";
import {connect} from "react-redux";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Modal from "@material-ui/core/Modal";
import {Backdrop, TextField, Tooltip, Zoom} from "@material-ui/core";
import Fade from "@material-ui/core/Fade";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import ChatIcon from "@material-ui/icons/Chat";
import {makeStyles} from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import {accountService, chatService} from "../../../services";
import CircularProgress from "@material-ui/core/CircularProgress";
import {chatActions} from "../../../actions";
import LinearProgress from "@material-ui/core/LinearProgress";

const useStyles = makeStyles(theme => ({
    widthHalfScreen: {
        width: '50vw',
    },
}));

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

function CreateChatModal({onOpen, addChat}) {
    const modalClasses = useModalStyles();
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [members, setMembers] = useState([]);
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const loading = open && contacts.length === 0;
    const error = attemptedSubmit && name.trim() === '';

    React.useEffect(() => {
        let active = true;

        if (!loading) {
            return undefined;
        }

        (async () => {
            const contacts = await accountService.getMyContacts();
            if (active) {
                setContacts(contacts);
            }
        })();

        return () => {
            active = false;
        };
    }, [loading]);

    useEffect(() => {
        if (!open) {
            setName('');
            setContacts([]);
            setMembers([]);
            setAttemptedSubmit(false);
        }
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name.trim() === '') {
            setAttemptedSubmit(true);
            return;
        }
        setSubmitting(true);
        try {
            const chat = await chatService.createGroupChat({name, members});
            addChat(chat);
            handleClose();
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpen = () => {
        if (onOpen) {
            onOpen();
            setTimeout(() => {
                setOpen(true);
            }, 10);
        } else {
            setOpen(true);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Tooltip TransitionComponent={Zoom} placement="right" title="Start new chat and invite your contacts">
                <ListItem button key="Create Chat" onClick={handleOpen}>
                    <ListItemIcon><ChatIcon/></ListItemIcon>
                    <ListItemText primary="Create Chat"/>
                </ListItem>
            </Tooltip>
            <Modal
                className={modalClasses.modal}
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open}>
                    <div className={modalClasses.window}>
                        <form onSubmit={handleSubmit}>
                            <div
                                className={`${modalClasses.paperBackground} ${classes.widthHalfScreen} d-flex flex-column`}>
                                <Box className="p-3" bgcolor="info.main" color="info.contrastText">
                                    <Typography variant="h5" gutterBottom>
                                        Create Chat
                                    </Typography>
                                </Box>
                                <Divider/>
                                {submitting && <LinearProgress/>}
                                <Box className="p-3">
                                    <TextField
                                        variant="outlined"
                                        label="Name"
                                        placeholder="Name"
                                        fullWidth
                                        className="mb-2"
                                        error={error}
                                        helperText={error && "Name can't be empty"}
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    />
                                    <Autocomplete
                                        multiple
                                        id="checkboxes-tags-demo"
                                        name="members"
                                        options={contacts}
                                        disableCloseOnSelect
                                        getOptionLabel={(contact) => `${contact.firstName} ${contact.lastName}`}
                                        renderOption={(contact, {selected}) => (
                                            <React.Fragment>
                                                <Checkbox
                                                    icon={icon}
                                                    checkedIcon={checkedIcon}
                                                    style={{marginRight: 8}}
                                                    checked={selected}
                                                />
                                                {`${contact.firstName} ${contact.lastName}`}
                                            </React.Fragment>
                                        )}
                                        fullWidth
                                        renderInput={(params) => (
                                            <TextField {...params}
                                                       variant="outlined"
                                                       label="Members"
                                                       placeholder="Add members"
                                                       InputProps={{
                                                           ...params.InputProps,
                                                           endAdornment: (
                                                               <React.Fragment>
                                                                   {loading ? <CircularProgress size={20}/> : null}
                                                                   {params.InputProps.endAdornment}
                                                               </React.Fragment>
                                                           ),
                                                       }}
                                            />
                                        )}
                                        onChange={(e, members,) => {
                                            setMembers(members);
                                        }}
                                    />
                                </Box>
                                <Divider/>
                                <Box className="p-3" bgcolor="info.main" color="info.contrastText">
                                    <Button
                                        className={`float-left ${modalClasses.closeButton}`}
                                        onClick={handleClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className={`float-right ${modalClasses.closeButton}`}
                                    >
                                        Confirm
                                    </Button>
                                </Box>
                            </div>
                        </form>
                    </div>
                </Fade>
            </Modal>
        </>
    );
}

const mapStateToProps = state => {
    return {};
}

const mapDispatchToProps = dispatch => {
    return {
        addChat: chat => dispatch(chatActions.addAndSelectIfNotExists(chat))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateChatModal);
