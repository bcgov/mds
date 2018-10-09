export const MINE_STATUS = [{
  value: 'Abandoned',
  label: 'Abandoned',
}, {
  value: 'Closed',
  label: 'Closed',
  children: [{
    value: 'Care & Maintenance',
    label: 'Care & Maintenance',
  }, {
    value: 'Reclamation',
    label: 'Reclamation',
    children: [{
      value: 'LTM',
      label: 'LTM',
    }, {
      value: 'LTM WT',
      label: 'LTM WT',
    },{
      value: 'Permit release Pending',
      label: 'Permit release Pending',
    }],
  },{
    value: 'Orphaned',
    label: 'Orphaned',
    children: [{
      value: 'LTM',
      label: 'LTM',
    }, {
      value: 'LTM WT',
      label: 'LTM WT',
    },{
      value: 'Reclaimed',
      label: 'Reclaimed',
    },{
      value: 'Not Reclaimed',
      label: 'Not Reclaimed',
    },{
      value: 'Unknown',
      label: 'Unknown',
    }],
  }, {
    value: 'Unknown',
    label: 'Unknown',
  }
],
}, {
  value: 'Not Started',
  label: 'Not Started',
}, {
  value: 'Operating',
  label: 'Operating',
  children: [{
    value: 'Year Round',
    label: 'Year round',
  },
    {
      value: 'Seasonal',
      label: 'Seasonal',
    }],
}];