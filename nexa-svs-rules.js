/* NEXA SvS Rules v1 */
(()=> {
  window.NEXA_SVS_RULES={
    key:'svs',
    battleStart:'12:00',
    battleEnd:'17:00',
    team1PetRequired:true,
    team2PetPreferred:true,
    petActivationHours:2,
    wholeHourScheduling:true,
    primaryAlliancePriority:true,
    allowCrossAllianceRotation:true,
    floatingRallyLeads:true,
    coverage:{
      team1:'PETS must remain active continuously when mathematically possible.',
      team2:'Use PETS when roster depth supports it without weakening Team 1.',
      otherTeams:'Use strongest effective available Rally Lead; PETS are optional.'
    }
  };
})();
