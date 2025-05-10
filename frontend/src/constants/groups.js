export const GROUPS = [
    { id: '1', name: 'C-1020' },
    { id: '2', name: 'C-1021' },
    { id: '3', name: 'C-1022' },
    { id: '4', name: 'C-1024' },
    { id: '5', name: 'E-1025' },
    { id: '6', name: 'E-1026' },
    { id: '7', name: 'E-1027' },
    { id: '8', name: 'E-1028' },
    { id: '9', name: 'E-1029' },
    { id: '10', name: 'F-1030' }
];

export const getGroupName = (id) => {
    const group = GROUPS.find(g => g.id === id);
    return group ? group.name : id;
};