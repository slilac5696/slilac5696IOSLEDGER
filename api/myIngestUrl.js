import {
  verifyUserJwt,
  getOrCreateIngestToken,
  publicOrigin,
} from './ingestLib.js'

export default async function myIngestUrl(req, res) {
  const user = await verifyUserJwt(req.headers.authorization)
  if (!user?.id) {
    return res.status(401).json({ error: 'Not signed in' })
  }

  try {
    const token = await getOrCreateIngestToken(user.id)
    const origin = publicOrigin(req)
    return res.status(200).json({
      token,
      webhookUrl: `${origin}/api/i/${token}`,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
