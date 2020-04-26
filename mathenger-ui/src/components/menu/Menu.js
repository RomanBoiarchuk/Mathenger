import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ChatIcon from "@material-ui/icons/Chat";
import ListItemText from "@material-ui/core/ListItemText";
import NotificationsIcon from "@material-ui/icons/Notifications";
import Divider from "@material-ui/core/Divider";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import * as React from "react";
import {authenticationActions} from "../../actions";
import {connect} from "react-redux";
import ContactsModal from "./buttons/ContactsModal";
import AddContactsModal from "./buttons/AddContactsModal";

function Menu({signOut, onClose}) {
    return (
        <>
            <List>
                <ListItem button key="Create Chat">
                    <ListItemIcon><ChatIcon/></ListItemIcon>
                    <ListItemText primary="Create Chat"/>
                </ListItem>
                <AddContactsModal onOpen={onClose}/>
                <ContactsModal onOpen={onClose}/>
                <ListItem button key="Notifications">
                    <ListItemIcon><NotificationsIcon/></ListItemIcon>
                    <ListItemText primary="Notifications"/>
                </ListItem>
            </List>
            <Divider/>
            <List>
                <ListItem button key="Sign Out" onClick={signOut}>
                    <ListItemIcon><ExitToAppIcon/></ListItemIcon>
                    <ListItemText primary="Sign Out"/>
                </ListItem>
            </List>
        </>
    );
}

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => {
    return {
        signOut: () => {
            dispatch(authenticationActions.signOut())
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Menu);