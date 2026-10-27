export const isMember = (userId, members) => {
    return members.some((member) => member.toString() === userId.toString());
};