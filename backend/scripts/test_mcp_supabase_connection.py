"""Test MCP Supabase connection and tool loading.

This script directly tests the MCP Supabase server endpoint to diagnose
why tools are not loading correctly after successful authentication.
"""
import json
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, Any, Optional

# Log file path
LOG_PATH = Path(__file__).parent.parent.parent / ".cursor" / "debug.log"
SERVER_ENDPOINT = "http://127.0.0.1:7242/ingest/5a2dc156-7002-40c6-bde1-4df847d61e58"

# MCP Configuration
MCP_URL = "https://mcp.supabase.com/mcp"
MCP_AUTH_TOKEN = "sb_publishable_ZwBxzanMQNpgG-Qhhj3NUw_8itMRTce"

def log_debug(session_id: str, run_id: str, hypothesis_id: str, location: str, message: str, data: Dict[str, Any] = None):
    """Log debug information to both file and HTTP endpoint."""
    timestamp = int(time.time() * 1000)
    log_entry = {
        "id": f"log_{timestamp}_{hash(message) % 10000}",
        "timestamp": timestamp,
        "location": location,
        "message": message,
        "data": data or {},
        "sessionId": session_id,
        "runId": run_id,
        "hypothesisId": hypothesis_id
    }
    
    # Write to file (NDJSON format)
    try:
        LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        print(f"Failed to write log file: {e}")
    
    # Send to HTTP endpoint
    try:
        req = urllib.request.Request(
            SERVER_ENDPOINT,
            data=json.dumps(log_entry).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req, timeout=1).read()
    except Exception:
        pass  # Silently fail if server is not available


def test_mcp_initialize(session_id: str, run_id: str):
    """Test MCP initialize handshake."""
    # #region agent log
    log_debug(session_id, run_id, "A", "test_mcp_supabase_connection.py:test_mcp_initialize:entry", 
              "Testing MCP initialize", {"url": MCP_URL})
    # #endregion
    
    try:
        # MCP initialize request
        initialize_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {}
                },
                "clientInfo": {
                    "name": "cursor-diagnostic",
                    "version": "1.0.0"
                }
            }
        }
        
        # #region agent log
        log_debug(session_id, run_id, "A", "test_mcp_supabase_connection.py:test_mcp_initialize:before_request", 
                  "Sending initialize request", {"request_size": len(json.dumps(initialize_request))})
        # #endregion
        
        req = urllib.request.Request(
            MCP_URL,
            data=json.dumps(initialize_request).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {MCP_AUTH_TOKEN}"
            }
        )
        
        response = urllib.request.urlopen(req, timeout=30)
        response_data = json.loads(response.read().decode("utf-8"))
        
        # #region agent log
        log_debug(session_id, run_id, "A", "test_mcp_supabase_connection.py:test_mcp_initialize:after_request", 
                  "Initialize response received", {"has_error": "error" in response_data, "has_result": "result" in response_data})
        # #endregion
        
        if "error" in response_data:
            # #region agent log
            log_debug(session_id, run_id, "A", "test_mcp_supabase_connection.py:test_mcp_initialize:error", 
                      "Initialize failed", {"error": response_data["error"]})
            # #endregion
            return False, response_data["error"], None
        
        return True, "Initialize successful", response_data.get("result")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else "No error body"
        # #region agent log
        log_debug(session_id, run_id, "A", "test_mcp_supabase_connection.py:test_mcp_initialize:http_error", 
                  "HTTP error during initialize", {"status": e.code, "reason": e.reason, "body": error_body[:200]})
        # #endregion
        return False, f"HTTP {e.code}: {e.reason}", None
    except Exception as e:
        # #region agent log
        log_debug(session_id, run_id, "A", "test_mcp_supabase_connection.py:test_mcp_initialize:exception", 
                  "Exception during initialize", {"error_type": type(e).__name__, "error_message": str(e)})
        # #endregion
        return False, str(e), None


def test_mcp_list_tools(session_id: str, run_id: str):
    """Test MCP tools/list request."""
    # #region agent log
    log_debug(session_id, run_id, "B", "test_mcp_supabase_connection.py:test_mcp_list_tools:entry", 
              "Testing tools/list request", {})
    # #endregion
    
    try:
        # First initialize
        init_success, init_message, init_result = test_mcp_initialize(session_id, run_id)
        if not init_success:
            return False, f"Initialize failed: {init_message}", []
        
        # #region agent log
        log_debug(session_id, run_id, "B", "test_mcp_supabase_connection.py:test_mcp_list_tools:after_init", 
                  "Initialize successful, requesting tools", {})
        # #endregion
        
        # MCP tools/list request
        list_tools_request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/list",
            "params": {}
        }
        
        # #region agent log
        log_debug(session_id, run_id, "B", "test_mcp_supabase_connection.py:test_mcp_list_tools:before_request", 
                  "Sending tools/list request", {})
        # #endregion
        
        req = urllib.request.Request(
            MCP_URL,
            data=json.dumps(list_tools_request).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {MCP_AUTH_TOKEN}"
            }
        )
        
        response = urllib.request.urlopen(req, timeout=30)
        response_data = json.loads(response.read().decode("utf-8"))
        
        # #region agent log
        log_debug(session_id, run_id, "B", "test_mcp_supabase_connection.py:test_mcp_list_tools:after_request", 
                  "Tools/list response received", {"has_error": "error" in response_data, "has_result": "result" in response_data})
        # #endregion
        
        if "error" in response_data:
            # #region agent log
            log_debug(session_id, run_id, "B", "test_mcp_supabase_connection.py:test_mcp_list_tools:error", 
                      "Tools/list failed", {"error": response_data["error"]})
            # #endregion
            return False, response_data["error"], []
        
        tools = response_data.get("result", {}).get("tools", [])
        # #region agent log
        log_debug(session_id, run_id, "B", "test_mcp_supabase_connection.py:test_mcp_list_tools:success", 
                  "Tools retrieved", {"tool_count": len(tools), "tool_names": [t.get("name", "unknown") for t in tools]})
        # #endregion
        
        return True, f"Found {len(tools)} tools", tools
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else "No error body"
        # #region agent log
        log_debug(session_id, run_id, "B", "test_mcp_supabase_connection.py:test_mcp_list_tools:http_error", 
                  "HTTP error during tools/list", {"status": e.code, "reason": e.reason, "body": error_body[:200]})
        # #endregion
        return False, f"HTTP {e.code}: {e.reason}", []
    except Exception as e:
        # #region agent log
        log_debug(session_id, run_id, "B", "test_mcp_supabase_connection.py:test_mcp_list_tools:exception", 
                  "Exception during tools/list", {"error_type": type(e).__name__, "error_message": str(e)})
        # #endregion
        return False, str(e), []


def test_mcp_authentication(session_id: str, run_id: str):
    """Test if authentication token is valid."""
    # #region agent log
    log_debug(session_id, run_id, "C", "test_mcp_supabase_connection.py:test_mcp_authentication:entry", 
              "Testing authentication", {"token_prefix": MCP_AUTH_TOKEN[:20] if MCP_AUTH_TOKEN else "none"})
    # #endregion
    
    try:
        # Simple request to check auth
        test_request = {
            "jsonrpc": "2.0",
            "id": 0,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "test", "version": "1.0.0"}
            }
        }
        
        # #region agent log
        log_debug(session_id, run_id, "C", "test_mcp_supabase_connection.py:test_mcp_authentication:before_request", 
                  "Sending auth test request", {})
        # #endregion
        
        req = urllib.request.Request(
            MCP_URL,
            data=json.dumps(test_request).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {MCP_AUTH_TOKEN}"
            }
        )
        
        response = urllib.request.urlopen(req, timeout=30)
        status_code = response.getcode()
        response_data = json.loads(response.read().decode("utf-8"))
        
        # #region agent log
        log_debug(session_id, run_id, "C", "test_mcp_supabase_connection.py:test_mcp_authentication:after_request", 
                  "Auth test response", {"status": status_code, "has_error": "error" in response_data})
        # #endregion
        
        if status_code == 200 and "error" not in response_data:
            # #region agent log
            log_debug(session_id, run_id, "C", "test_mcp_supabase_connection.py:test_mcp_authentication:success", 
                      "Authentication successful", {})
            # #endregion
            return True, "Authentication successful"
        elif "error" in response_data:
            error_code = response_data["error"].get("code", "unknown")
            # #region agent log
            log_debug(session_id, run_id, "C", "test_mcp_supabase_connection.py:test_mcp_authentication:auth_error", 
                      "Authentication failed", {"error_code": error_code, "error": response_data["error"]})
            # #endregion
            return False, f"Auth error: {error_code}"
        else:
            return False, f"Unexpected response: {status_code}"
    except urllib.error.HTTPError as e:
        # #region agent log
        log_debug(session_id, run_id, "C", "test_mcp_supabase_connection.py:test_mcp_authentication:http_error", 
                  "HTTP error during auth test", {"status": e.code, "reason": e.reason})
        # #endregion
        if e.code == 401:
            return False, "Unauthorized - Invalid token"
        elif e.code == 403:
            return False, "Forbidden - Token lacks permissions"
        return False, f"HTTP {e.code}: {e.reason}"
    except Exception as e:
        # #region agent log
        log_debug(session_id, run_id, "C", "test_mcp_supabase_connection.py:test_mcp_authentication:exception", 
                  "Exception during auth test", {"error_type": type(e).__name__, "error_message": str(e)})
        # #endregion
        return False, str(e)


def test_mcp_server_info(session_id: str, run_id: str):
    """Get MCP server information."""
    # #region agent log
    log_debug(session_id, run_id, "D", "test_mcp_supabase_connection.py:test_mcp_server_info:entry", 
              "Getting server info", {})
    # #endregion
    
    try:
        # Try to get server info or capabilities
        init_success, init_message, init_result = test_mcp_initialize(session_id, run_id)
        if init_success and init_result:
            server_info = {
                "protocolVersion": init_result.get("protocolVersion"),
                "serverInfo": init_result.get("serverInfo", {}),
                "capabilities": init_result.get("capabilities", {})
            }
            # #region agent log
            log_debug(session_id, run_id, "D", "test_mcp_supabase_connection.py:test_mcp_server_info:success", 
                      "Server info retrieved", server_info)
            # #endregion
            return True, server_info
        else:
            return False, {"error": init_message}
    except Exception as e:
        # #region agent log
        log_debug(session_id, run_id, "D", "test_mcp_supabase_connection.py:test_mcp_server_info:exception", 
                  "Exception getting server info", {"error": str(e)})
        # #endregion
        return False, {"error": str(e)}


def main():
    """Run all MCP diagnostic tests."""
    session_id = "mcp-supabase-debug"
    run_id = "run1"
    
    print("=" * 70)
    print("MCP Supabase Connection & Tool Loading Diagnostic")
    print("=" * 70)
    print(f"MCP URL: {MCP_URL}")
    print(f"Auth Token: {MCP_AUTH_TOKEN[:20]}...")
    print()
    
    # #region agent log
    log_debug(session_id, run_id, "ALL", "test_mcp_supabase_connection.py:main:start", 
              "Diagnostic started", {"url": MCP_URL})
    # #endregion
    
    # Test 1: Authentication
    print("1. Testing Authentication...")
    auth_success, auth_message = test_mcp_authentication(session_id, run_id)
    if auth_success:
        print(f"   ✅ {auth_message}")
    else:
        print(f"   ❌ {auth_message}")
    print()
    
    # Test 2: Initialize
    print("2. Testing MCP Initialize...")
    init_success, init_message, init_result = test_mcp_initialize(session_id, run_id)
    if init_success:
        print(f"   ✅ {init_message}")
        if init_result:
            print(f"   Server Info: {json.dumps(init_result.get('serverInfo', {}), indent=6)}")
    else:
        print(f"   ❌ {init_message}")
    print()
    
    # Test 3: List Tools
    print("3. Testing Tools/List (This is where the issue likely occurs)...")
    tools_success, tools_message, tools = test_mcp_list_tools(session_id, run_id)
    if tools_success:
        print(f"   ✅ {tools_message}")
        if tools:
            print(f"   Tools found:")
            for tool in tools:
                print(f"     - {tool.get('name', 'unknown')}: {tool.get('description', 'no description')[:60]}")
        else:
            print("   ⚠️  No tools returned (empty list)")
    else:
        print(f"   ❌ {tools_message}")
        print("   This is likely the root cause of the tool loading issue!")
    print()
    
    # Test 4: Server Info
    print("4. Getting Server Information...")
    info_success, info_data = test_mcp_server_info(session_id, run_id)
    if info_success:
        print(f"   ✅ Server Info:")
        print(f"   {json.dumps(info_data, indent=6)}")
    else:
        print(f"   ❌ {info_data.get('error', 'Unknown error')}")
    print()
    
    # #region agent log
    log_debug(session_id, run_id, "ALL", "test_mcp_supabase_connection.py:main:complete", 
              "Diagnostic completed", {"summary": "All tests executed"})
    # #endregion
    
    print("=" * 70)
    print("Diagnostic complete. Check logs at:", LOG_PATH)
    print("=" * 70)


if __name__ == "__main__":
    main()

