const OnlyForSuperUser = ({ user, yes, no }) => user.super || user.superbp ? yes() : no();

OnlyForSuperUser.defaultProps = {
    user: {},
	yes: () => null,
	no: () => null,
};

export default OnlyForSuperUser;