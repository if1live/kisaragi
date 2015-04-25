using UnityEngine;
using System.Collections;
using SocketIO;

public class Main : MonoBehaviour {
	private SocketIOComponent socket;
	
	// Use this for initialization
	void Start () {
		GameObject go = GameObject.Find ("SocketIO");
		socket = go.GetComponent <SocketIOComponent>();

		socket.On ("chat message", onChatMessage);
		socket.On("open", onSocketOpen);
		socket.On("error", onSocketError);
		socket.On("close", onSocketClose);

		StartCoroutine("BeepBoop");
	}

	private IEnumerator BeepBoop()
	{
		yield return new WaitForSeconds(1);

		JSONObject payload = new JSONObject(JSONObject.Type.ARRAY);
		payload.Add ("first");
		socket.Emit ("chat message", payload);

		yield return null;
	}

	public void onChatMessage(SocketIOEvent e) {
		Debug.Log("[SocketIO] ChatMessage received: " + e.name + " " + e.data);
	}

	public void onSocketOpen(SocketIOEvent e)
	{
		Debug.Log("[SocketIO] Open received: " + e.name + " " + e.data);
	}
	
	public void onSocketError(SocketIOEvent e)
	{
		Debug.Log("[SocketIO] Error received: " + e.name + " " + e.data);
	}
	
	public void onSocketClose(SocketIOEvent e)
	{	
		Debug.Log("[SocketIO] Close received: " + e.name + " " + e.data);
	}
	
	// Update is called once per frame
	void Update () {
	
	}
}
