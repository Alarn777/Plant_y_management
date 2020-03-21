

export const removeCleaner = cleaner => ({
    type: 'REMOVE_CLEANER',
    payload: cleaner,
});

export const addImage = imageUrl => ({
    type: 'ADD_IMAGE',
    payload: imageUrl,
});

export const removeEvent = event => ({
    type: 'REMOVE_EVENT',
    payload: event,
});

export const addEvent = event => ({
    type: 'ADD_EVENT',
    payload: event,
});

export const cleanReduxState = event => ({
    type: 'CLEAN_STATE',
    payload: event,
});

export const addSocket = socket => ({
    type: 'ADD_SOCKET',
    payload: socket,
});

export const addStreamUrl = cleaner => ({
    type: 'ADD_STREAM_URL',
    payload: cleaner,
});

export const addUser = user => ({
    type: 'ADD_USER',
    payload: user,
});

export const loadPlanters = user => ({
    type: 'LOAD_PLANTERS',
    payload: user,
});

export const AddAvatarLink = link => ({
    type: 'ADD_AVATAR_LINK',
    payload: link,
});

export const fetchPosts = posts => {
    return {
        type: 'FETCH_POST',
        posts,
    };
};
