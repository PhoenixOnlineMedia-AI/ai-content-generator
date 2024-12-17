class TeamService {
    async createTeam(name, ownerId) {
      try {
        const team = await Team.create({
          name,
          owner: ownerId,
          members: [{ user: ownerId, role: 'owner' }]
        });
        return team;
      } catch (error) {
        throw new Error('Failed to create team');
      }
    }
  
    async inviteMembers(teamId, emails, role = 'member') {
      try {
        const invites = await Promise.all(
          emails.map(email => this.createInvite(teamId, email, role))
        );
        return invites;
      } catch (error) {
        throw new Error('Failed to invite members');
      }
    }
  
    async shareContent(contentId, teamId, permissions = 'view') {
      try {
        const sharing = await ContentSharing.create({
          content: contentId,
          team: teamId,
          permissions
        });
        return sharing;
      } catch (error) {
        throw new Error('Failed to share content');
      }
    }
  }  