// Avatar props from name
export const stringAvatar = (name = '') => {
    const words = name.split(' ');
    const initials = words
        .map((word) => word?.[0]?.toUpperCase() || '')
        .slice(0, 2)
        .join('');

    return {
        sx: {
            bgcolor: 'white !important',
            color: 'black !important',
            fontWeight: 'bold !important',
            cursor: "pointer !important",
        },
        children: initials,
    };
};

// Function to check if user has permission for a specific action
export const hasPermission = (user, slug, action = "view") => {
    if (user?.user_type === 1) return true;

    if (!user?.permission) return false;

    const moduleKey = slug.charAt(0).toUpperCase() + slug.slice(1);
    const modulePermissions = user.permission[moduleKey];

    return modulePermissions?.some(
        (perm) => perm.action === action && perm.is_access === true
    );
};

export const ITEM_HEIGHT = 48;
export const ITEM_PADDING_TOP = 8;
export const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};
