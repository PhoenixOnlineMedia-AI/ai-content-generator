const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const teamService = require('../services/teamService');

router.post('/teams', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const team = await teamService.createTeam(name, req.user._id);
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/teams/:teamId/invite', auth, async (req, res) => {
  try {
    const { emails, role } = req.body;
    const invites = await teamService.inviteMembers(
      req.params.teamId,
      emails,
      role
    );
    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/teams/:teamId/content/:contentId/share', auth, async (req, res) => {
  try {
    const { permissions } = req.body;
    const sharing = await teamService.shareContent(
      req.params.contentId,
      req.params.teamId,
      permissions
    );
    res.json(sharing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});