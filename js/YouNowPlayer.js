"use strict";
var getStats = function(mediaStreamTrack, callback, interval) {
    function getStatsLooper() {
        getStatsWrapper(function(results) {
            if (results && results.forEach) {
                results.forEach(function(result) {
                    Object.keys(getStatsParser).forEach(function(key) {
                        if ("function" == typeof getStatsParser[key]) try {
                            getStatsParser[key](result)
                        } catch (e) {
                            console.error(e.message, e.stack, e)
                        }
                    })
                });
                try {
                    peer.iceConnectionState.search(/failed|closed|disconnected/gi) !== -1 && (nomore = !0)
                } catch (e) {
                    nomore = !0
                }
                nomore === !0 && (getStatsResult.datachannel && (getStatsResult.datachannel.state = "close"), getStatsResult.ended = !0), getStatsResult.results = results, getStatsResult.audio && getStatsResult.video && (getStatsResult.bandwidth.speed = getStatsResult.audio.bytesSent - getStatsResult.bandwidth.helper.audioBytesSent + (getStatsResult.video.bytesSent - getStatsResult.bandwidth.helper.videoBytesSent), getStatsResult.bandwidth.helper.audioBytesSent = getStatsResult.audio.bytesSent, getStatsResult.bandwidth.helper.videoBytesSent = getStatsResult.video.bytesSent), callback(getStatsResult), nomore || void 0 != typeof interval && interval && setTimeout(getStatsLooper, interval || 1e3)
            }
        })
    }

    function getStatsWrapper(cb) {
        "undefined" != typeof window.InstallTrigger || isSafari ? peer.getStats(window.mediaStreamTrack || null).then(function(res) {
            var items = [];
            res.forEach(function(r) {
                items.push(r)
            }), cb(items)
        })["catch"](cb) : peer.getStats(function(res) {
            var items = [];
            res.result().forEach(function(res) {
                var item = {};
                res.names().forEach(function(name) {
                    item[name] = res.stat(name)
                }), item.id = res.id, item.type = res.type, item.timestamp = res.timestamp, items.push(item)
            }), cb(items)
        })
    }
    var browserFakeUserAgent = "Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45";
    ! function(that) {
        that && "undefined" == typeof window && "undefined" != typeof global && (global.navigator = {
            userAgent: browserFakeUserAgent,
            getUserMedia: function() {}
        }, global.console || (global.console = {}), "undefined" != typeof global.console.log && "undefined" != typeof global.console.error || (global.console.error = global.console.log = global.console.log || function() {
            console.log(arguments)
        }), "undefined" == typeof document && (that.document = {
            documentElement: {
                appendChild: function() {
                    return ""
                }
            }
        }, document.createElement = document.captureStream = document.mozCaptureStream = function() {
            var obj = {
                getContext: function() {
                    return obj
                },
                play: function() {},
                pause: function() {},
                drawImage: function() {},
                toDataURL: function() {
                    return ""
                }
            };
            return obj
        }, that.HTMLVideoElement = function() {}), "undefined" == typeof location && (that.location = {
            protocol: "file:",
            href: "",
            hash: ""
        }), "undefined" == typeof screen && (that.screen = {
            width: 0,
            height: 0
        }), "undefined" == typeof URL && (that.URL = {
            createObjectURL: function() {
                return ""
            },
            revokeObjectURL: function() {
                return ""
            }
        }), "undefined" == typeof MediaStreamTrack && (that.MediaStreamTrack = function() {}), "undefined" == typeof RTCPeerConnection && (that.RTCPeerConnection = function() {}), that.window = global)
    }("undefined" != typeof global ? global : null);
    var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    "undefined" == typeof MediaStreamTrack && (MediaStreamTrack = {});
    var systemNetworkType = ((navigator.connection || {}).type || "unknown").toString().toLowerCase(),
        getStatsResult = {
            encryption: "sha-256",
            audio: {
                send: {
                    tracks: [],
                    codecs: [],
                    availableBandwidth: 0,
                    streams: 0,
                    framerateMean: 0,
                    bitrateMean: 0
                },
                recv: {
                    tracks: [],
                    codecs: [],
                    availableBandwidth: 0,
                    streams: 0,
                    framerateMean: 0,
                    bitrateMean: 0
                },
                bytesSent: 0,
                bytesReceived: 0,
                latency: 0,
                packetsLost: 0
            },
            video: {
                send: {
                    tracks: [],
                    codecs: [],
                    availableBandwidth: 0,
                    streams: 0,
                    framerateMean: 0,
                    bitrateMean: 0
                },
                recv: {
                    tracks: [],
                    codecs: [],
                    availableBandwidth: 0,
                    streams: 0,
                    framerateMean: 0,
                    bitrateMean: 0
                },
                bytesSent: 0,
                bytesReceived: 0,
                latency: 0,
                packetsLost: 0
            },
            bandwidth: {
                systemBandwidth: 0,
                sentPerSecond: 0,
                encodedPerSecond: 0,
                helper: {
                    audioBytesSent: 0,
                    videoBytestSent: 0
                },
                speed: 0
            },
            results: {},
            connectionType: {
                systemNetworkType: systemNetworkType,
                systemIpAddress: "192.168.1.2",
                local: {
                    candidateType: [],
                    transport: [],
                    ipAddress: [],
                    networkType: []
                },
                remote: {
                    candidateType: [],
                    transport: [],
                    ipAddress: [],
                    networkType: []
                }
            },
            resolutions: {
                send: {
                    width: 0,
                    height: 0
                },
                recv: {
                    width: 0,
                    height: 0
                }
            },
            internal: {
                audio: {
                    send: {},
                    recv: {}
                },
                video: {
                    send: {},
                    recv: {}
                },
                candidates: {}
            },
            nomore: function() {
                nomore = !0
            }
        },
        getStatsParser = {
            checkIfOfferer: function(result) {
                "googLibjingleSession" === result.type && (getStatsResult.isOfferer = result.googInitiator)
            }
        },
        isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
        peer = this;
    if (!(arguments[0] instanceof RTCPeerConnection)) throw "1st argument is not instance of RTCPeerConnection.";
    peer = arguments[0], arguments[1] instanceof MediaStreamTrack && (mediaStreamTrack = arguments[1], callback = arguments[2], interval = arguments[3]);
    var nomore = !1;
    getStatsParser.datachannel = function(result) {
        "datachannel" === result.type && (getStatsResult.datachannel = {
            state: result.state
        })
    }, getStatsParser.googCertificate = function(result) {
        "googCertificate" == result.type && (getStatsResult.encryption = result.googFingerprintAlgorithm), "certificate" == result.type && (getStatsResult.encryption = result.fingerprintAlgorithm)
    }, getStatsParser.checkAudioTracks = function(result) {
        if ("audio" === result.mediaType) {
            var sendrecvType = result.id.split("_").pop();
            if (result.isRemote === !0 && (sendrecvType = "recv"), result.isRemote === !1 && (sendrecvType = "send"), sendrecvType) {
                if (getStatsResult.audio[sendrecvType].codecs.indexOf(result.googCodecName || "opus") === -1 && getStatsResult.audio[sendrecvType].codecs.push(result.googCodecName || "opus"), result.bytesSent) {
                    var kilobytes = 0;
                    getStatsResult.internal.audio[sendrecvType].prevBytesSent || (getStatsResult.internal.audio[sendrecvType].prevBytesSent = result.bytesSent);
                    var bytes = result.bytesSent - getStatsResult.internal.audio[sendrecvType].prevBytesSent;
                    getStatsResult.internal.audio[sendrecvType].prevBytesSent = result.bytesSent, kilobytes = bytes / 1024, getStatsResult.audio[sendrecvType].availableBandwidth = kilobytes.toFixed(1), getStatsResult.audio.bytesSent = kilobytes.toFixed(1)
                }
                if (result.bytesReceived) {
                    var kilobytes = 0;
                    getStatsResult.internal.audio[sendrecvType].prevBytesReceived || (getStatsResult.internal.audio[sendrecvType].prevBytesReceived = result.bytesReceived);
                    var bytes = result.bytesReceived - getStatsResult.internal.audio[sendrecvType].prevBytesReceived;
                    getStatsResult.internal.audio[sendrecvType].prevBytesReceived = result.bytesReceived, kilobytes = bytes / 1024, getStatsResult.audio.bytesReceived = kilobytes.toFixed(1)
                }
                if (result.googTrackId && getStatsResult.audio[sendrecvType].tracks.indexOf(result.googTrackId) === -1 && getStatsResult.audio[sendrecvType].tracks.push(result.googTrackId), result.googCurrentDelayMs) {
                    var kilobytes = 0;
                    getStatsResult.internal.audio.prevGoogCurrentDelayMs || (getStatsResult.internal.audio.prevGoogCurrentDelayMs = result.googCurrentDelayMs);
                    var bytes = result.googCurrentDelayMs - getStatsResult.internal.audio.prevGoogCurrentDelayMs;
                    getStatsResult.internal.audio.prevGoogCurrentDelayMs = result.googCurrentDelayMs, getStatsResult.audio.latency = bytes.toFixed(1), getStatsResult.audio.latency < 0 && (getStatsResult.audio.latency = 0)
                }
                if (result.packetsLost) {
                    var kilobytes = 0;
                    getStatsResult.internal.audio.prevPacketsLost || (getStatsResult.internal.audio.prevPacketsLost = result.packetsLost);
                    var bytes = result.packetsLost - getStatsResult.internal.audio.prevPacketsLost;
                    getStatsResult.internal.audio.prevPacketsLost = result.packetsLost, getStatsResult.audio.packetsLost = bytes.toFixed(1), getStatsResult.audio.packetsLost < 0 && (getStatsResult.audio.packetsLost = 0)
                }
            }
        }
    }, getStatsParser.checkVideoTracks = function(result) {
        if ("video" === result.mediaType) {
            var sendrecvType = result.id.split("_").pop();
            if (result.isRemote === !0 && (sendrecvType = "recv"), result.isRemote === !1 && (sendrecvType = "send"), sendrecvType) {
                if (getStatsResult.video[sendrecvType].codecs.indexOf(result.googCodecName || "VP8") === -1 && getStatsResult.video[sendrecvType].codecs.push(result.googCodecName || "VP8"), result.bytesSent) {
                    var kilobytes = 0;
                    getStatsResult.internal.video[sendrecvType].prevBytesSent || (getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent);
                    var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevBytesSent;
                    getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent, kilobytes = bytes / 1024, getStatsResult.video[sendrecvType].availableBandwidth = kilobytes.toFixed(1), getStatsResult.video.bytesSent = kilobytes.toFixed(1)
                }
                if (result.bytesReceived) {
                    var kilobytes = 0;
                    getStatsResult.internal.video[sendrecvType].prevBytesReceived || (getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived);
                    var bytes = result.bytesReceived - getStatsResult.internal.video[sendrecvType].prevBytesReceived;
                    getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived, kilobytes = bytes / 1024, getStatsResult.video.bytesReceived = kilobytes.toFixed(1)
                }
                if (result.googFrameHeightReceived && result.googFrameWidthReceived && (getStatsResult.resolutions[sendrecvType].width = result.googFrameWidthReceived, getStatsResult.resolutions[sendrecvType].height = result.googFrameHeightReceived), result.googFrameHeightSent && result.googFrameWidthSent && (getStatsResult.resolutions[sendrecvType].width = result.googFrameWidthSent, getStatsResult.resolutions[sendrecvType].height = result.googFrameHeightSent), result.googTrackId && getStatsResult.video[sendrecvType].tracks.indexOf(result.googTrackId) === -1 && getStatsResult.video[sendrecvType].tracks.push(result.googTrackId), result.framerateMean) {
                    getStatsResult.bandwidth.framerateMean = result.framerateMean;
                    var kilobytes = 0;
                    getStatsResult.internal.video[sendrecvType].prevFramerateMean || (getStatsResult.internal.video[sendrecvType].prevFramerateMean = result.bitrateMean);
                    var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevFramerateMean;
                    getStatsResult.internal.video[sendrecvType].prevFramerateMean = result.framerateMean, kilobytes = bytes / 1024, getStatsResult.video[sendrecvType].framerateMean = bytes.toFixed(1)
                }
                if (result.bitrateMean) {
                    getStatsResult.bandwidth.bitrateMean = result.bitrateMean;
                    var kilobytes = 0;
                    getStatsResult.internal.video[sendrecvType].prevBitrateMean || (getStatsResult.internal.video[sendrecvType].prevBitrateMean = result.bitrateMean);
                    var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevBitrateMean;
                    getStatsResult.internal.video[sendrecvType].prevBitrateMean = result.bitrateMean, kilobytes = bytes / 1024, getStatsResult.video[sendrecvType].bitrateMean = bytes.toFixed(1)
                }
                if (result.googCurrentDelayMs) {
                    var kilobytes = 0;
                    getStatsResult.internal.video.prevGoogCurrentDelayMs || (getStatsResult.internal.video.prevGoogCurrentDelayMs = result.googCurrentDelayMs);
                    var bytes = result.googCurrentDelayMs - getStatsResult.internal.video.prevGoogCurrentDelayMs;
                    getStatsResult.internal.video.prevGoogCurrentDelayMs = result.googCurrentDelayMs, getStatsResult.video.latency = bytes.toFixed(1), getStatsResult.video.latency < 0 && (getStatsResult.video.latency = 0)
                }
                if (result.packetsLost) {
                    var kilobytes = 0;
                    getStatsResult.internal.video.prevPacketsLost || (getStatsResult.internal.video.prevPacketsLost = result.packetsLost);
                    var bytes = result.packetsLost - getStatsResult.internal.video.prevPacketsLost;
                    getStatsResult.internal.video.prevPacketsLost = result.packetsLost, getStatsResult.video.packetsLost = bytes.toFixed(1), getStatsResult.video.packetsLost < 0 && (getStatsResult.video.packetsLost = 0)
                }
            }
        }
    }, getStatsParser.bweforvideo = function(result) {
        "VideoBwe" === result.type && (getStatsResult.bandwidth.availableSendBandwidth = result.googAvailableSendBandwidth, getStatsResult.bandwidth.googActualEncBitrate = result.googActualEncBitrate, getStatsResult.bandwidth.googAvailableSendBandwidth = result.googAvailableSendBandwidth, getStatsResult.bandwidth.googAvailableReceiveBandwidth = result.googAvailableReceiveBandwidth, getStatsResult.bandwidth.googRetransmitBitrate = result.googRetransmitBitrate, getStatsResult.bandwidth.googTargetEncBitrate = result.googTargetEncBitrate, getStatsResult.bandwidth.googBucketDelay = result.googBucketDelay, getStatsResult.bandwidth.googTransmitBitrate = result.googTransmitBitrate)
    }, getStatsParser.candidatePair = function(result) {
        if ("googCandidatePair" === result.type || "candidate-pair" === result.type || "local-candidate" === result.type || "remote-candidate" === result.type) {
            if ("true" == result.googActiveConnection) {
                Object.keys(getStatsResult.internal.candidates).forEach(function(cid) {
                    var candidate = getStatsResult.internal.candidates[cid];
                    candidate.ipAddress.indexOf(result.googLocalAddress) !== -1 && (getStatsResult.connectionType.local.candidateType = candidate.candidateType, getStatsResult.connectionType.local.ipAddress = candidate.ipAddress, getStatsResult.connectionType.local.networkType = candidate.networkType, getStatsResult.connectionType.local.transport = candidate.transport), candidate.ipAddress.indexOf(result.googRemoteAddress) !== -1 && (getStatsResult.connectionType.remote.candidateType = candidate.candidateType, getStatsResult.connectionType.remote.ipAddress = candidate.ipAddress, getStatsResult.connectionType.remote.networkType = candidate.networkType, getStatsResult.connectionType.remote.transport = candidate.transport)
                }), getStatsResult.connectionType.transport = result.googTransportType;
                var localCandidate = getStatsResult.internal.candidates[result.localCandidateId];
                localCandidate && localCandidate.ipAddress && (getStatsResult.connectionType.systemIpAddress = localCandidate.ipAddress);
                var remoteCandidate = getStatsResult.internal.candidates[result.remoteCandidateId];
                remoteCandidate && remoteCandidate.ipAddress && (getStatsResult.connectionType.systemIpAddress = remoteCandidate.ipAddress)
            }
            if ("candidate-pair" === result.type && result.selected === !0 && result.nominated === !0 && "succeeded" === result.state) var localCandidate = getStatsResult.internal.candidates[result.remoteCandidateId],
                remoteCandidate = getStatsResult.internal.candidates[result.remoteCandidateId];
            if ("local-candidate" === result.type && (getStatsResult.connectionType.local.candidateType = result.candidateType, getStatsResult.connectionType.local.ipAddress = result.ipAddress, getStatsResult.connectionType.local.networkType = result.networkType, getStatsResult.connectionType.local.transport = result.mozLocalTransport || result.transport), "remote-candidate" === result.type && (getStatsResult.connectionType.remote.candidateType = result.candidateType, getStatsResult.connectionType.remote.ipAddress = result.ipAddress, getStatsResult.connectionType.remote.networkType = result.networkType, getStatsResult.connectionType.remote.transport = result.mozRemoteTransport || result.transport), isSafari) {
                var sendrecvType = result.localCandidateId ? "send" : "recv";
                if (!sendrecvType) return;
                if (result.bytesSent) {
                    var kilobytes = 0;
                    getStatsResult.internal.video[sendrecvType].prevBytesSent || (getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent);
                    var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevBytesSent;
                    getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent, kilobytes = bytes / 1024, getStatsResult.video[sendrecvType].availableBandwidth = kilobytes.toFixed(1), getStatsResult.video.bytesSent = kilobytes.toFixed(1)
                }
                if (result.bytesReceived) {
                    var kilobytes = 0;
                    getStatsResult.internal.video[sendrecvType].prevBytesReceived || (getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived);
                    var bytes = result.bytesReceived - getStatsResult.internal.video[sendrecvType].prevBytesReceived;
                    getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived, kilobytes = bytes / 1024, getStatsResult.video.bytesReceived = kilobytes.toFixed(1)
                }
                if (result.availableOutgoingBitrate) {
                    var kilobytes = 0;
                    getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate || (getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate = result.availableOutgoingBitrate);
                    var bytes = result.availableOutgoingBitrate - getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate;
                    getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate = result.availableOutgoingBitrate, kilobytes = bytes / 1024, getStatsResult.video.availableOutgoingBitrate = kilobytes.toFixed(1)
                }
                if (result.availableIncomingBitrate) {
                    var kilobytes = 0;
                    getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate || (getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate = result.availableIncomingBitrate);
                    var bytes = result.availableIncomingBitrate - getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate;
                    getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate = result.availableIncomingBitrate, kilobytes = bytes / 1024, getStatsResult.video.availableIncomingBitrate = kilobytes.toFixed(1)
                }
            }
        }
    };
    var LOCAL_candidateType = {},
        LOCAL_transport = {},
        LOCAL_ipAddress = {},
        LOCAL_networkType = {};
    getStatsParser.localcandidate = function(result) {
        "localcandidate" !== result.type && "local-candidate" !== result.type || result.id && (LOCAL_candidateType[result.id] || (LOCAL_candidateType[result.id] = []), LOCAL_transport[result.id] || (LOCAL_transport[result.id] = []), LOCAL_ipAddress[result.id] || (LOCAL_ipAddress[result.id] = []), LOCAL_networkType[result.id] || (LOCAL_networkType[result.id] = []), result.candidateType && LOCAL_candidateType[result.id].indexOf(result.candidateType) === -1 && LOCAL_candidateType[result.id].push(result.candidateType), result.transport && LOCAL_transport[result.id].indexOf(result.transport) === -1 && LOCAL_transport[result.id].push(result.transport), result.ipAddress && LOCAL_ipAddress[result.id].indexOf(result.ipAddress + ":" + result.portNumber) === -1 && LOCAL_ipAddress[result.id].push(result.ipAddress + ":" + result.portNumber), result.networkType && LOCAL_networkType[result.id].indexOf(result.networkType) === -1 && LOCAL_networkType[result.id].push(result.networkType), getStatsResult.internal.candidates[result.id] = {
            candidateType: LOCAL_candidateType[result.id],
            ipAddress: LOCAL_ipAddress[result.id],
            portNumber: result.portNumber,
            networkType: LOCAL_networkType[result.id],
            priority: result.priority,
            transport: LOCAL_transport[result.id],
            timestamp: result.timestamp,
            id: result.id,
            type: result.type
        }, getStatsResult.connectionType.local.candidateType = LOCAL_candidateType[result.id], getStatsResult.connectionType.local.ipAddress = LOCAL_ipAddress[result.id], getStatsResult.connectionType.local.networkType = LOCAL_networkType[result.id], getStatsResult.connectionType.local.transport = LOCAL_transport[result.id])
    };
    var REMOTE_candidateType = {},
        REMOTE_transport = {},
        REMOTE_ipAddress = {},
        REMOTE_networkType = {};
    getStatsParser.remotecandidate = function(result) {
        "remotecandidate" !== result.type && "remote-candidate" !== result.type || result.id && (REMOTE_candidateType[result.id] || (REMOTE_candidateType[result.id] = []), REMOTE_transport[result.id] || (REMOTE_transport[result.id] = []), REMOTE_ipAddress[result.id] || (REMOTE_ipAddress[result.id] = []), REMOTE_networkType[result.id] || (REMOTE_networkType[result.id] = []), result.candidateType && REMOTE_candidateType[result.id].indexOf(result.candidateType) === -1 && REMOTE_candidateType[result.id].push(result.candidateType), result.transport && REMOTE_transport[result.id].indexOf(result.transport) === -1 && REMOTE_transport[result.id].push(result.transport), result.ipAddress && REMOTE_ipAddress[result.id].indexOf(result.ipAddress + ":" + result.portNumber) === -1 && REMOTE_ipAddress[result.id].push(result.ipAddress + ":" + result.portNumber), result.networkType && REMOTE_networkType[result.id].indexOf(result.networkType) === -1 && REMOTE_networkType[result.id].push(result.networkType), getStatsResult.internal.candidates[result.id] = {
            candidateType: REMOTE_candidateType[result.id],
            ipAddress: REMOTE_ipAddress[result.id],
            portNumber: result.portNumber,
            networkType: REMOTE_networkType[result.id],
            priority: result.priority,
            transport: REMOTE_transport[result.id],
            timestamp: result.timestamp,
            id: result.id,
            type: result.type
        }, getStatsResult.connectionType.remote.candidateType = REMOTE_candidateType[result.id], getStatsResult.connectionType.remote.ipAddress = REMOTE_ipAddress[result.id], getStatsResult.connectionType.remote.networkType = REMOTE_networkType[result.id], getStatsResult.connectionType.remote.transport = REMOTE_transport[result.id])
    }, getStatsParser.dataSentReceived = function(result) {
        !result.googCodecName || "video" !== result.mediaType && "audio" !== result.mediaType || (result.bytesSent && (getStatsResult[result.mediaType].bytesSent = parseInt(result.bytesSent)), result.bytesReceived && (getStatsResult[result.mediaType].bytesReceived = parseInt(result.bytesReceived)))
    }, getStatsParser.inboundrtp = function(result) {
        if (isSafari && "inbound-rtp" === result.type) {
            var mediaType = result.mediaType || "audio",
                sendrecvType = result.isRemote ? "recv" : "send";
            if (sendrecvType) {
                if (result.bytesSent) {
                    var kilobytes = 0;
                    getStatsResult.internal[mediaType][sendrecvType].prevBytesSent || (getStatsResult.internal[mediaType][sendrecvType].prevBytesSent = result.bytesSent);
                    var bytes = result.bytesSent - getStatsResult.internal[mediaType][sendrecvType].prevBytesSent;
                    getStatsResult.internal[mediaType][sendrecvType].prevBytesSent = result.bytesSent, kilobytes = bytes / 1024, getStatsResult[mediaType][sendrecvType].availableBandwidth = kilobytes.toFixed(1), getStatsResult[mediaType].bytesSent = kilobytes.toFixed(1)
                }
                if (result.bytesReceived) {
                    var kilobytes = 0;
                    getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived || (getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived = result.bytesReceived);
                    var bytes = result.bytesReceived - getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived;
                    getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived = result.bytesReceived, kilobytes = bytes / 1024, getStatsResult[mediaType].bytesReceived = kilobytes.toFixed(1)
                }
            }
        }
    }, getStatsParser.outboundrtp = function(result) {
        if (isSafari && "outbound-rtp" === result.type) {
            var mediaType = result.mediaType || "audio",
                sendrecvType = result.isRemote ? "recv" : "send";
            if (sendrecvType) {
                if (result.bytesSent) {
                    var kilobytes = 0;
                    getStatsResult.internal[mediaType][sendrecvType].prevBytesSent || (getStatsResult.internal[mediaType][sendrecvType].prevBytesSent = result.bytesSent);
                    var bytes = result.bytesSent - getStatsResult.internal[mediaType][sendrecvType].prevBytesSent;
                    getStatsResult.internal[mediaType][sendrecvType].prevBytesSent = result.bytesSent, kilobytes = bytes / 1024, getStatsResult[mediaType][sendrecvType].availableBandwidth = kilobytes.toFixed(1), getStatsResult[mediaType].bytesSent = kilobytes.toFixed(1)
                }
                if (result.bytesReceived) {
                    var kilobytes = 0;
                    getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived || (getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived = result.bytesReceived);
                    var bytes = result.bytesReceived - getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived;
                    getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived = result.bytesReceived, kilobytes = bytes / 1024, getStatsResult[mediaType].bytesReceived = kilobytes.toFixed(1)
                }
            }
        }
    }, getStatsParser.track = function(result) {
        if (isSafari && "track" === result.type) {
            var sendrecvType = result.remoteSource === !0 ? "send" : "recv";
            result.frameWidth && result.frameHeight && (getStatsResult.resolutions[sendrecvType].width = result.frameWidth, getStatsResult.resolutions[sendrecvType].height = result.frameHeight)
        }
    };
    var SSRC = {
        audio: {
            send: [],
            recv: []
        },
        video: {
            send: [],
            recv: []
        }
    };
    getStatsParser.ssrc = function(result) {
        if (result.googCodecName && ("video" === result.mediaType || "audio" === result.mediaType) && "ssrc" === result.type) {
            var sendrecvType = result.id.split("_").pop();
            SSRC[result.mediaType][sendrecvType].indexOf(result.ssrc) === -1 && SSRC[result.mediaType][sendrecvType].push(result.ssrc), getStatsResult[result.mediaType][sendrecvType].streams = SSRC[result.mediaType][sendrecvType].length
        }
    }, getStatsLooper()
};
"undefined" != typeof module && (module.exports = getStats), "function" == typeof define && define.amd && define("getStats", [], function() {
    return getStats
});

var i = 0;

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
    get: function() {
        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
    }
})

function toTimestring(t) {
    var hours = Math.floor(t / (60 * 60));
    var minutes = Math.floor(t / (60)) % 60;
    var seconds = Math.floor(t % 60);

    var time = "";

    if (hours > 0) time += hours + ":";
    if (minutes > 9) time += minutes + ":";
    else time += "0" + minutes + ":";
    if (seconds > 9) time += seconds;
    else time += "0" + seconds;

    return time;
}

var YouNowPlayer = function() {

    var self = this;

    function makeScreenshot(video) {
        if(self.isConnected) {        
        	if(video == null) {
        		video = $('video')[0];
        	}    

        	var w;
        	var h;
        	var canvas = document.createElement('canvas');
        	var ctx = canvas.getContext('2d');

        	if(video !== null) {
        		var w = video.videoWidth;
            	var h = video.videoHeight;
                canvas.width  = w;
                canvas.height = h;            	
                ctx.drawImage(video, 0, 0, w, h);
        	}            
            
            var base64 = canvas.toDataURL();
            canvas.remove();
            $.featherlight('<h2>' + $('#streamerID').val() + moment().format('DDMMYY_HHmmss') + '.png</h2>' + '<a class="button" style="background:#000; color:#FFF" download="' + $('#streamerID').val() + moment().format('DDMMYY_HHmmss') + '.png" href="' + base64 + '">Download</a><br><img src="' + base64 + '" />');
        }
	}

    $('#streamView').on('click', '.snapshotButton', function() {
    	makeScreenshot($(this).closest('.video').find('video')[0]);
    });

    $('#snapshotButton').click(function() {
    	makeScreenshot(null);
    });

    $('#stop').click(function() {
        $('#reconnectCheckbox').prop('checked', false);
        self.disconnect.bind(self)();
    });

    this.language = this.config["language"]["de_DE"];
    this.loading = false;
    this.banBypass = false;
    this.rpc = null;
    this.crownMapping = [null, null, null, null, '0+3', '0+2', '0+1', '3+0', '2+0', '1+0', '1+1', '1+2', '2+1', '0+4', '0+5', '4+0', '5+0', '1+3', '2+2', '3+1', '1+4', '2+3', '3+2', '4+1'];
    this.reconnectInterval = 0;
    this.loadGuestsInterval = 0;
    this.streamIDs = [];
    this.signalingWS = null;

    $('#labelStreamer').html(this.language["streamer"]);
    $('#connect').val(this.language["connect"]);
    this.disconnected();
    setInterval(function() {
        self.tick();
    }, 1000);

};
YouNowPlayer.prototype.connect = function(streamerID, mode) {
    if (this.loading)
        return;

    clearInterval(this.reconnectInterval);
    this.loading = true;
    this.streamerID = streamerID;

    this.disconnect();
    $('#connect').html(this.language["connecting"]);
    var self = this;
    $.ajax({
        url: 'https://api.younow.com/php/api/broadcast/info/curId=0/user=' + streamerID,
        jsonp: self.banBypass ? null : "callback",
        dataType: self.banBypass ? "json" : "jsonp",
        success: function(json, b, c) {
            if (json["errorCode"] > 0 && mode == 0) {
                if (json["errorCode"] == 134) {
                    self.failed("Dieser User hat dich auf YouNow gebannt.", "Um den Stream anzusehen, bitte auf YouNow ausloggen und alle YouNow-Cookies löschen!");
                } else if (json["errorCode"] == 102) {
                    self.failed("Es existiert kein User namens \"" + escapeHtml(streamerID) + "\" auf YouNow.", 'Möglicherweise ist der Name falsch geschrieben oder der User wurde kürzlich gebannt.<br>Hinweis: Hier darf NICHT der Anzeigename (z.B. "Hans M.") eingegeben werden, sondern der Profilname (steht am Ende der YouNow-Adresse, z.B. "https://younow.com/DracheOffiziell").');
                } else
                    self.failed(escapeHtml(streamerID) + ' streamt gerade nicht auf YouNow' + ".", 'Positionier dich doch zeitlich einfach so, dass du ' + escapeHtml(streamerID) + ' sehen kannst, er dich aber nicht - ferstest du?');

                streamerOnline = false;
            } else if (json.userId == null || !json.hasOwnProperty('state') || json.state != 'onBroadcastPlay' || !json.hasOwnProperty('user') || json.user == null) {
                if (mode == 0)
                    self.failed("Stream noch nicht verfügbar", escapeHtml(streamerID) + " verbindet sich gerade neu oder hat gerade die Verbindung verloren. Bitte in einigen Augenblicken erneut versuchen.", 'warning');

                streamerOnline = false;
            } else if (json["errorCode"] > 0 && mode == 1) {
                streamerOnline = false;
                playerOnline = false;
                firstDone = true;
            } else {
                firstDone = true;
                streamerOnline = true;
                playerOnline = true;

                stats.subcount = json.subscribersCount;
                self.streamerData.numShares = json.shares;
                stats.viewersTotal = json.viewsWithThreshold;
                stats.viewersLoggedin = json.lviewers;


                $('#viewersTotal').html((1 * stats.viewersTotal).toFormat(0, ',', '.'));
                $('#numShares').html((1 * self.streamerData.numShares).toFormat(0, ',', '.'));
                $('#viewersLoggedin').html((1 * stats.viewersLoggedin).toFormat(0, ',', '.'));

                $.ajax({
                    url: 'https://api.younow.com/php/api/channel/getInfo/channelId=' + json.userId,
                    jsonp: "callback",
                    dataType: "jsonp",
                    success: function(json, b, c) {
                        if (!!json.totalSubscribers && json.isSubscribable) {
                            $('#bar_monitor').addClass('subscribable');
                            $('#numSubsTotal').html(json.totalSubscribers);
                            self.streamerData.subsTotal = json.totalSubscribers;
                        } else {
                            $('#bar_monitor').removeClass('subscribable');
                        }

                        self.streamerData.isPartner = json.isPartner;
                    }
                });

                self.connected(json);
            }

            self.loading = false;


        },

        error: function() {
            self.failed("Netzwerkfehler", "YouNow ist gerade nicht erreichbar (oder wird von deinem Browser blockiert).");
            self.loading = false;
        }
    });
};
YouNowPlayer.prototype.disconnect = function() {
    if (this.pusher != null) {
        try {
            this.pusher.disconnect();
        } catch (e) {

        }
    }

    console.log(this);

    if (this.rpc != null) {
        this.rpc.close();
        this.rpc = null;

        try {
            this.signalingWS.close();
        } catch (e) {
            this.signalingWS.websocket.close();
        }

        this.signalingWS = null;
    }

    clearInterval(this.loadGuestsInterval);
    this.disconnected();
    playerOnline = false;
};
YouNowPlayer.prototype.disconnected = function() {
    document.title = 'Junau-Player';
    $('#vlcButton, #linkButton, #snapshotButton').parent().css('display', 'none');
    $('#messages').html("");
    $('#streamBar, #streamView').css('display', 'none');
    $('#stop').css('display', 'none');
    $('#blockBar').css('display', 'none');
    $('#welcome1, #welcome2, #welcome3').css('display', 'block');
    $('#stream').css('position', 'none');
    $('#streamBar').css('display', 'none')
    $('#connect').html(this.language["disconnected"]);
    $('#streamerInfo').html("");
    $('#top').html("");
    this.isConnected = false;
};
YouNowPlayer.prototype.streamerData = {};
YouNowPlayer.prototype.connected = function(streamerData) {
    this.streamIDs = [];
    this.streamerData = streamerData;
    this.streamerData.mutedUsers = !!this.streamerData.silentFromChatUsers ? JSON.parse(this.streamerData.silentFromChatUsers) : [];
    stats.mutedUsers = this.streamerData.mutedUsers;
    $('#viewersYounow').html((1 * this.streamerData.viewers).toFormat(0, ',', '.'));
    $('#streamLikes').html((1 * this.streamerData.likes).toFormat(0, ',', '.'));
    $('#numSubsTotal').html(this.streamerData.subsTotal);
    $('#streamMutes').html(!!this.streamerData.silentFromChatUsers ? JSON.parse(this.streamerData.silentFromChatUsers).length.toFormat(0, ',', '.') : 0);
    $('#numMods').html(!!this.streamerData.broadcastMods ? JSON.parse(this.streamerData.broadcastMods).length : 0);

    for (var i in streamerData.comments) {
        this.addChatMessage(streamerData.comments[i], undefined, true);
    }

    $('#linkButton').siblings('.popup').find('p > span').text($('#streamerID').val());
    $('#linkButton').siblings('.popup').find('textarea').text([location.protocol, '//', location.host, location.pathname].join('') + '?s=' + $('#streamerID').val());

    $('#connect').html(this.language["connected"]);

    $('#welcome1, #welcome2, #welcome3').css('display', 'none');
    $('#nff').css('display', 'block');
    $('#linkButton, #snapshotButton').parent().css('display', 'block');
    $('#stop').css('display', 'block');
    $('#stream').css('position', 'relative');
    $('#streamBar').css('display', 'block')
        .css('position', 'absolute')
        .css('bottom', '0')
        .css('left', '0')
        .css('width', '100%');
    $('#flash-info').css('display', 'block');

    if (settings.showBlocklist) {
        $('#blockBar').css('display', 'block');
        $('#streamView').css('height', 'calc(100% - 80px)');
    }

    var d = new Date();
    this.timeStart = d.getTime();
    this.peerId = uuidv4();
    this.fakeUserId = ~~(10000000 + Math.random() * 10000000);
    this.authKey = null;
    this.packetsLost = 0;
    this.duration = this.streamerData.length;

    this.isConnected = true;
    this.tick();
    this.rpcConnected = false;

    if (this.signalingWS != null) {
        this.signalingWS.close();
        this.rpc.close();
    }


    var self = this;
    this.signalingWS = new WebSocket(atob("d3NzOi8vanVuYXV3cy56ZXJvZHkub25l")+"?roomId=' + this.streamerData.broadcastId + '&isHost=false&peerId=' + self.peerId);

    this.signalingWS.onopen = function() {
        var uidStreams = {};
        var sdpSemantics = 'plan-b';

        $('#streamView').css('display', 'block').html('');

        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            sdpSemantics = 'unified-plan';
        }

        var rpc = new RTCPeerConnection({
            sdpSemantics: sdpSemantics,
            iceServers: [{
                urls: "stun:stun.services.mozilla.com"
            }, {
                urls: "stun:stun.l.google.com:19302"
            }]
        });

        getStats(rpc, function(result) {
            if (result.internal.video.prevPacketsLost - self.packetsLost > 5) {
                $('#streamDroppedFrames').html(Math.floor((result.internal.video.prevPacketsLost - self.packetsLost) / 2.0).toFormat(0, ',', '.') + '/s').parent().css('display', 'block');
            } else {
                $('#streamDroppedFrames').parent().css('display', 'none');
            }

            self.packetsLost = result.internal.video.prevPacketsLost;
        }, 2000);

        self.rpc = rpc;

        self.signalingWS.send('{"join":true,"recvOnly":true,"token":"","maxBw":500,"onStage":false,"sdpSemantics":"' + sdpSemantics + '","peerId":"' + self.peerId + '","userId":"' + self.fakeUserId + '","authKey":null,"roomId":"' + self.streamerData.broadcastId + '","applicationId":"YouNow-Web","sdkVersion":"js-1.1.25"}');

        rpc.onicecandidate = function(evt) {
            console.log(evt);
            self.signalingWS.send(JSON.stringify({
                "candidate": evt.candidate
            }));

        };

        rpc.onicecandidate = function(ev) {
            if (ev.candidate) {
                self.signalingWS.send(JSON.stringify({
                    "ice": {
                        "candidate": ev.candidate,
                        "sdpMid": "audio",
                        "sdpMLineIndex": 0,
                        "usernameFragment": "nu9e"
                    },
                    "peerId": self.peerId,
                    "userId": self.fakeUserId,
                    "authKey": self.authKey,
                    "roomId": self.streamerData.broadcastId,
                    "applicationId": "YouNow-Web",
                    "sdkVersion": "js-1.1.25"
                }));
            }
        };

        rpc.ontrack = function(ev) {

			var newStreams = [];

			if(ev.track.kind != 'video') {
			    return;
			}

			for(var c in ev.streams) {
				var j = ev.streams[c];


			    if($('#streamView .video[data-id="' + j.id + '"]').length > 0) {
			        continue;
			    }

				if(newStreams.indexOf(j.id) == -1) {
			        newStreams.push(j.id);
			    }

			    $('#streamView').append('<div class="video" data-id="' + j.id + '"><div class="userbadge"><span class="username userinfo" data-uid=""></span><div class="snapshotButton"><i class="fa fa-camera"></i></div></div><video autoplay controls/></div>');
			    $('#streamView .video[data-id="' + j.id + '"] video')[0].srcObject = j;

			    
				(function(k) {
					getUser(uidStreams[k.id], function(u) {
						$('.video[data-id="' + k.id + '"] .userbadge').children('.username').attr('data-uid', u.userId).html(u.profile + ' (' + u.level + ')');

						if(u.userId == self.streamerData.userId) {
							$('.video[data-id="' + k.id + '"]').prependTo('#streamView').find('.userbadge .username').css('font-weight', 'bold').css('color', '#5A9FFB');
						}
					});
				})(j);

			    
			}
		    
		};

        self.signalingWS.onmessage = function(evt) {
            var signal = JSON.parse(evt.data);

            if (signal.sdp) {
                if(self.rpcConnected) {
                    return;
                }

                var newStreams = [];

                for(var c in signal.streams) {
		    if(newStreams.indexOf(signal.streams[c].stream) > -1) continue;

                    newStreams.push(signal.streams[c].stream);
                    uidStreams[signal.streams[c].stream] = signal.streams[c].userId;
                }

                $('#streamView .video').each(function() {
                    if(newStreams.indexOf($(this).attr('data-id')) == -1) {
                        $(this).remove();
                    }
                });

                self.streamIDs = newStreams;

                $('#streamView').removeClass('v1 v2 v3 v4').addClass('v' + self.streamIDs.length);

	      
                rpc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
                .then(function() {
                    return rpc.createAnswer();
                }).then(function(answer) {
                    return rpc.setLocalDescription(answer);
                }).then(function() {
                    self.signalingWS.send(JSON.stringify({sdp: rpc.localDescription, "peerId": self.peerId, "userId":self.fakeUserId,"authKey": self.authKey,"roomId": self.streamerData.broadcastId,"applicationId":"YouNow-Web","sdkVersion":"js-1.1.21"}));
                });
            }
			else if (signal.ice) {
				var cand = new RTCIceCandidate(signal.ice);
				rpc.addIceCandidate(cand);
			} 
			else if(signal.authKey) {
				self.authKey = signal.authKey;
			}
        }
    }

    this.pusher = new Pusher('d5b7447226fc2cd78dbb', {
        cluster: "younow"
    });
    this.channel = this.pusher.subscribe("public-channel_" + this.streamerData.userId);
    var self = this;

    this.channel.bind('onLikes', function(data) {
        self.streamerData.likes = data.message.likes;
        self.streamerData.viewers = data.message.viewers;
        refreshViewers();

        $('#viewersYounow').html((1 * self.streamerData.viewers).toFormat(0, ',', '.'));
        $('#streamLikes').html((1 * self.streamerData.likes).toFormat(0, ',', '.'));

    });

    this.channel.bind('onViewers', function(data) {
        self.streamerData.likes = data.message.likes;
        self.streamerData.viewers = data.message.viewers;
        refreshViewers();

        $('#viewersYounow').html((1 * self.streamerData.viewers).toFormat(0, ',', '.'));
        $('#streamLikes').html((1 * self.streamerData.likes).toFormat(0, ',', '.'));

    });

    this.channel.bind('onChat', function(data) {
        for (i = 0; i < data.message.comments.length; i++)
            self.addChatMessage(data.message.comments[i], '');
    });

    this.channel.bind('onGift', function(data) {
        for (i = 0; i < data.message.gifts.length; i++) {
            if (data.message.gifts[i].comment.trim().length > 0 && data.message.gifts[i].comment.trim().match(/^\(x([0-9]+)\)$/g) == null) {
                self.addChatMessage(data.message.gifts[i], data.message.gifts[i].SKU == 'SUBSCRIPTION' ? 'subscription' : 'gift');
                queue.enqueue({
                    disptime: 4000,
                    message: data.message.gifts[i].comment
                });
            }

            if (data.message.gifts[i].SKU == 'SHERIFF_2') {
                self.addChatMessage(data.message.gifts[i], 'newmod');
            }
        }
    });

    this.channel.bind('onSuperMessage', function(data) {
        try {
            for (i = 0; i < data.message.superMessages.length; i++) {
                if (data.message.superMessages[i].comment.trim().length > 0) {
                    self.addChatMessage(data.message.superMessages[i], 'super');
                }
            }
        } catch (e) {

        }
    });

    this.channel.bind('onBroadcastEnd', function() {
        self.disconnect();
        checkIfOnline();
    });

    this.channel.bind('onBroadcastDisconnect', function() {
        self.disconnect();
        checkIfOnline();
    });

    this.channel.bind('onBroadcastPlayData', function(data) {
        $('#connWarning').hide();
        self.streamerData.subViewers = data.message.subscribersCount;
        self.streamerData.numShares = data.message.shares;
        stats.chatMode = data.message.chatMode;
        if (data.message.isSeeding == 1) {
            $('.item.seeding').css('display', 'block');
            $('#barsHuman .lgTitle').html('Freespin-Seeding aktiv').addClass('seeding').siblings('.sum').children('span:eq(1)').css('color', 'orange');
        } else {
            $('.item.seeding').css('display', 'none');
            $('#barsHuman .lgTitle').html('Σ Bars').removeClass('seeding').siblings('.sum').children('span:eq(1)').css('color', '#777');
        }
  
        $('#streamMoments').html(data.message.numMomentsCreated.toFormat(0, ',', '.'));

        if (self.streamerData.subViewers > 0) {
            $('#viewersSubs').css('display', 'inline').html(self.streamerData.subViewers + ' <span>S</span> anwesend');
        } else {
            $('#viewersSubs').css('display', 'none');
        }

        $('#viewersTotal').html((1 * stats.viewersTotal).toFormat(0, ',', '.'));
    });

    this.channel.bind('onBroadcastCancel', function() {
        self.disconnect();
        checkIfOnline();
    });
};
YouNowPlayer.prototype.showTempBan = function(uid) {
    var self = this;

    $.ajax({
        url: 'https://api.younow.com/php/api/channel/getInfo/channelId=' + uid,
        jsonp: "callback",
        dataType: "jsonp",
        success: function(json, b, c) {
            if (json.errorCode !== 0)
                return;

            self.addChatMessage({
                userId: json.userId,
                profileUrlString: json.profile,
                name: json.firstName == '' ? json.profile : json.firstName,
                userLevel: json.level,
                comment: '<strong>Von Moderator STUMMGESCHALTET bis Streamende</strong>'
            }, 'halfban');
        }
    });
}

YouNowPlayer.prototype.addChatMessage = function(message, spcClass, noTimestamp) {
    var wasBottom = false;
    if ($("#messages").scrollTop() > $("#messages")[0].scrollHeight - $("#messages").height() - 25)
        wasBottom = true;
    if ($('#messages').children().length > this.config.maxMessages - 1)
        $('#messages').children()[0].remove();

    var timestamp = !!noTimestamp ? '<span class="timestamp">(History)</span>' : ('<span class="timestamp">' + moment().format('HH:mm:ss') + '</span>');

    var roleFlags = this.crownMapping[1 * message.role];
    var flags = '';

    if (typeof roleFlags === 'string') {
        if (roleFlags.split('+')[0] > 0)
            flags += '<span class="crowns red" title="Globaler Top-Spender auf YN">' + '•'.repeat(roleFlags.split('+')[0]) + '</span>';

        if (roleFlags.split('+')[1] > 0)
            flags += '<span class="crowns gold" title="Top-Spender für diesen Streamer">' + '•'.repeat(roleFlags.split('+')[1]) + '</span>';
    }

    if (spcClass != 'status' && spcClass != 'statusError')
        $('#messages').append('<li class="' + spcClass + '"><div class="img" data-uid="' + message.userId + '"><img src="https://cdn2.younow.com/php/api/channel/getImage/?channelId=' + message.userId + '" height="30" /></div><span>' + timestamp + ' <strong>' + (message.optedToGuest ? '<span style="color:#08db66;" title="Bereit für Gaststream">G</span> ' : '') + (message.broadcasterMod ? '<span class="flag" title="Moderator">M</span>' : '') + (message.subscriptionType > 0 ? '<span class="sub" title="Abonnent">S</span>' : '') + ' ' + (message.role === 1 ? '<span class="sub" title="Younow-Moderator">YN-MOD</span>' : flags) + '<a target="_blank" class="userinfo" data-uid="' + message.userId + '">' + message.name + (message.userLevel > 0 ? ' (' + ~~(message.userLevel) + ')' : '') + '</a>: </strong>' + (!!message.giftValue ? ' <span class="gift_flag">' + message.giftValue + '</span> ' : '') + (spcClass != 'newmod' ? message.comment : 'ist jetzt Moderator') + '</span></li>');
    else
        $('#messages').append('<li class="' + spcClass + '">' + message + '</li>');

    if (wasBottom) {
        $("#messages").animate({
            scrollTop: $("#messages")[0].scrollHeight
        }, 200)
    }
};

YouNowPlayer.prototype.updateInfo = function() {
    var self = this;
    var time = toTimestring(this.duration);
    $('#streamTime').html(time);


    $('#streamTime').html(time);

    document.title = '▶ ' + (this.duration < 3600 ? '0:' + time : time).substring(0, (this.duration < 3600 ? '0:' + time : time).lastIndexOf(':')) + 'h' + (this.streamerData.isPartner && stats.monitored ? ' | $' + (!!stats.est ? stats.est.toFormat(2, ',', '.') : '') : '');

    if (stats.subonly)
        $('#streamLowlevel').html('sub-only').css('color', '#E70B0B');
    else if (stats.lowlevel > 0)
        $('#streamLowlevel').html(stats.lowlevel).css('color', stats.lowlevel <= 5 ? '#EFDE59' : '#E70B0B');
    else
        $('#streamLowlevel').html('0').css('color', '#D8FFD5');

    if (typeof this.streamerData.subonly !== 'undefined' && (this.streamerData.subonly != stats.subonly || this.streamerData.lowlevel != stats.lowlevel)) {
        var msg;

        if (this.streamerData.subonly != stats.subonly)
            msg = 'Sub-Only-Modus ist nun ' + (stats.subonly ? 'AN' : 'AUS');
        else
            msg = 'Lowlevel-Chat ist ' + ((stats.lowlevel == 0) ? 'AUS' : ('nun auf Stufe ' + stats.lowlevel));

        this.addChatMessage(msg, 'status');
    }

    if (typeof this.streamerData.mutes !== 'undefined' && this.streamerData.mutes != stats.mutes) {
        $('#streamMutes').html(stats.mutes.toFormat(0, ',', '.'));

        var df = stats.mutedUsers.filter(function(a) {
            return self.streamerData.mutedUsers.indexOf(a) < 0
        });

        for (var i in df) {
            this.showTempBan(df[i]);
        }
    }

    this.streamerData.subonly = stats.subonly;
    this.streamerData.lowlevel = stats.lowlevel;
    this.streamerData.broadcastMods = stats.mods;
    this.streamerData.mutes = stats.mutes;
    this.streamerData.mutedUsers = stats.mutedUsers;

    if (stats.mods > -1) {
        $('#numMods').html(this.streamerData.broadcastMods.toFormat(0, ',', '.'));
    }

    if (!!this.streamerData.guest) {
        if (!$('#guestStreamStatus').is(':visible')) {
            $('#guestStreamStatus').fadeIn(200);
        }

        $('#guestStreamStatus a').html(this.streamerData.guest.username + ' (' + this.streamerData.guest.level + ')').attr('data-uid', this.streamerData.guest.userId);
        $('#guestStreamStatus span').html(toTimestring((new Date().getTime() - this.streamerData.guest.timeStart) / 1000));
    } else if ($('#guestStreamStatus').is(':visible')) {
        $('#guestStreamStatus').fadeOut(200);
    }
}
YouNowPlayer.prototype.failed = function(error, title, type) {
    this.disconnected();
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-full-width",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "10000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    toastr[!!type ? type : "error"](title, error);
};
YouNowPlayer.prototype.tick = function() {
    if (this.isConnected) {
        var d = new Date();
        this.duration = this.streamerData.length + Math.floor((d.getTime() - this.timeStart) / 1000);

        this.updateInfo();
    }
};
YouNowPlayer.prototype.isConnected = false;
YouNowPlayer.prototype.config = {
    maxMessages: 200,
    icons: {
        "disconnected": "icons/disconnect.png",
        "connected": "icons/connect.png",
        "ban": "icons/ban.png",
        "youtube": "icons/yt.png",
        "facebook": "icons/facebook.png",
        "twitter": "icons/twitter.png",
        "googleplus": "icons/gplus.png",
        "bars": "icons/icon_bar_sm.png",
        "coins": "icons/menu_user_coins1.png",
        "views": "icons/eye-icon.png",
        "time": "icons/clock.png",
        "likes": "icons/thumbs_up.png",
        "shares": "icons/megaphone.png"
    },
    language: {
        "de_DE": {
            "disconnected": '<i class="fa fa-play"></i>',
            "connecting": '<i class="fa fa-hourglass"></i>',
            "connected": '<i class="fa fa-refresh"></i>',
            "connect": "Verbinden",
            "streamer": "Streamer:",
            "to": "bis",
            "in": "in",
            "chat": "Chat",
            "users": "Benutzer",
            "viewers": "Zuschauer",
            "moderators": "Moderator(en)",
            "shares": "Teilung(en)",
            "likes": "Like(s)",
            "chatlvl": "Chat-Level"
        }
    }
};
